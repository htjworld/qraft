# CLAUDE.md — Qraft

## 이 프로젝트가 존재하는 이유

**사람들은 QR코드를 "못생긴 것"으로 인식한다.** 카페, 명함, SNS 프로필 어디든 QR코드가 필요하지만, 기본 QR코드는 흑백 픽셀 덩어리다. "이쁜 QR"을 만들어주는 서비스는 있지만 대부분 유료이거나, 무겁거나, 회원가입이 필요하다.

**Qraft는 이 문제를 극단적으로 가볍게 푼다.**
- URL 하나 입력하면 즉시 귀여운 3D 스타일 QR코드가 렌더링된다.
- 서버 없음. GitHub Pages 정적 호스팅.
- 회원가입 없음. 결제 없음.
- 벚꽃나무, 고양이, 강아지 등 스타일을 골라 QR코드를 꾸민다.

## 비즈니스 문제 정의

| 문제 | Qraft의 답 |
|------|-----------|
| QR코드 디자인 서비스는 비싸거나 무겁다 | 서버리스 정적 사이트, 무료, 즉시 사용 |
| 기존 서비스는 "커스텀"이지 "귀여운"이 아니다 | 3D WebGPU 렌더링으로 벚꽃/고양이/강아지 등 감성 스타일 제공 |
| 사용자는 빠른 결과를 원한다 | 텍스트 입력 → 실시간 렌더링, 클릭 한 번으로 스타일 전환 |
| 인디해커가 유지보수할 수 있어야 한다 | 서버 비용 $0, 스타일 추가 = 새 모듈 파일 하나 |

## 핵심 원칙

1. **극단적 경량화** — 서버리스, 번들 최소화, GitHub Pages 배포
2. **즉시성** — 입력 즉시 렌더링, 로딩 없음
3. **감성 우선** — "커스텀"이 아닌 "귀여운" QR코드
4. **모듈 확장** — 스타일 하나 = 독립된 모듈 하나. 새 스타일 추가 시 기존 코드 수정 불필요

## 기술 제약

- WebGPU 미지원 브라우저 → Canvas 2D fallback (MVP 이후)
- GitHub Pages = 정적 파일만 가능 → 모든 로직 클라이언트사이드
- QR코드 스캔 가능성 유지 필수 → 2D 플랫 뷰 전환 기능 (레퍼런스에 이미 구현됨)

## ⚠️ QR 스캔 대비(Contrast) — 절대 지켜야 할 규칙

**새 스타일을 만들거나 색상을 수정할 때 반드시 확인할 것.**

QR 스캐너는 dark 모듈과 light 모듈의 **명암 대비**로만 코드를 읽는다.  
대비가 부족하면 외관상 예뻐도 스캔이 안 된다. 실제로 고양이/강아지 초기 구현이 이 이유로 스캔 불가였다.

**벚꽃을 기준 레퍼런스로 삼아라:**
- Light 모듈 (Dirt 블록 top face): `vec3f(1.00, 0.98, 0.94)` — 거의 흰색
- Dark 모듈 (CherryBlossom top face 가장 밝은 값): `vec3f(0.70, 0.25, 0.38)` — 짙은 로즈

이 두 값의 대비를 시각적 기준으로 삼는다. Dark 모듈의 linear 밝기는 **대략 0.20 이하**여야 한다.

**금지 패턴 — 이렇게 하면 스캔 안 됨:**
- Dark 모듈에 크림/밝은 톤 mix: `mix(orangeFur, creamFur, ...)` — creamFur가 light bg와 구별 안 됨
- Dark 모듈에 골든/아이보리처럼 밝은 색 단독 사용
- Light/Dark 모듈 색이 같은 계열의 명도만 차이나는 경우

**올바른 패턴:**
- Dark 모듈: 짙은 기반색에서 medium으로 변화 (bright tone 절대 포함 금지)
- Light 모듈: near-white 유지 (`vec3f >= 0.95`)
- 두 값을 나란히 놓고 "한눈에 구별되는가" 확인

## ⚠️ WebGPU Vertex Shader — gridSize 대응 필수 규칙

**새 스타일을 만들거나 vertex shader를 수정할 때 반드시 확인할 것.**

QR URL이 길어질수록 gridSize가 커진다 (v3=29 → v10=57 → v20=97 → v40=177).  
vertex shader에서 gridSize가 커지면 두 가지 문제가 연쇄 발생한다.

### 1. Depth Clipping (블록이 잘려 사라짐)

`sizeScale = 29.0 / uniforms.gridSize` 는 X/Y 화면 좌표에 자동 적용되지만,  
depth 계산에 빠뜨리면 gridSize가 커질수록 블록이 NDC z 범위 [0,1] 밖으로 나가 하드웨어 클리핑된다.

**잘못된 패턴:**
```wgsl
out.pos = vec4f(..., fp.z * 0.5 + 0.5, 1.0);
```

**올바른 패턴 — sizeScale을 depth에도 적용:**
```wgsl
out.pos = vec4f(..., fp.z * sizeScale * 0.5 + 0.5, 1.0);
```

검증: gridSize=29에서 sizeScale=1이므로 결과 동일. gridSize=57 이상부터 효과.

### 2. Sway Flickering (캐노피 깜빡거림)

`bY` (블록 baseY)는 gridSize에 비례해 커진다 (`cubeH = BLOCK_SIZE * gridSize/29`).  
sway 진폭이 `0.002 * bY` 형태면 gridSize가 커질수록 월드 공간 진동이 gridSize배 증폭.  
캐노피에 블록이 밀집된 상태에서 depth 충돌이 급증 → 깜빡거림.

**잘못된 패턴:**
```wgsl
lp.x += sin(...) * 0.002 * bY;
lp.z += sin(...) * 0.0015 * bY;
```

**올바른 패턴 — gridSize로 정규화:**
```wgsl
let swayNorm = 29.0 / uniforms.gridSize;
lp.x += sin(...) * 0.002 * bY * swayNorm;
lp.z += sin(...) * 0.0015 * bY * swayNorm;
```

이렇게 하면 `bY * swayNorm = layer * BLOCK_SIZE` (상수)가 되어 어떤 gridSize에서도 월드 진폭 동일.

---

## 타겟 사용자

- SNS 프로필에 QR 넣고 싶은 사람
- 명함/포스터에 귀여운 QR 필요한 소규모 사업자
- "이쁜 거" 좋아하는 모든 사람

## 성공 지표

- GitHub Stars ≥ 100 (첫 달)
- 트위터/X 바이럴 1회 이상
- 월 MAU 1,000+ (Google Analytics)
