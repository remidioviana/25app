# Dimensional branding and platform materials

## Implemented scope

Five first-lot launcher artworks have been replaced with original dimensional compositions: forensic glass leaves (Himayah), a travertine gateway (Iqamah), connected economic volumes (Istithmar), an institutional proposal folio (Munagasah) and a warm ceramic civic path (Sahil). Functional interface lettering remains real text. Existing wordmarks, logo vectors and historical source assets are preserved; this does not declare a complete logo-system redesign or all 25 icons complete.

Each has two separate assets: an opaque full-bleed PNG for the launcher/iOS artwork, and a transparent Android adaptive foreground. Android supplies the background color and launcher mask. The foreground deliberately has extra transparent margins; it is not meant to appear as a small standalone square in an image viewer. The Expo configuration selects the correct asset for each platform. Existing assets remain available for the other 20 applications.

These are flattened dimensional illustrations. They are not editable Icon Composer `.icon` files, automatic dark/tinted variants, a 3D scene or live system-lighting layers. Those remain future native production work.

## Native material implementation

`NavigationMaterial` uses Expo 58's native `GlassView` for the drawer control layer only when both iOS availability checks pass and the user's transparency, contrast and inversion preferences are known and compatible. Unknown/error states stay solid; preference events cannot be overwritten by a late initial query. Reduced motion remains handled by the existing motion provider.

Android and Web use the same navigation controls and route behavior with opaque brand surfaces. Android adds native elevation. Neither platform calls an iOS-only capability probe or receives raw `GlassView` props. This is an intentional platform treatment, not a disabled menu. Document canvases, financial charts and primary content remain opaque. The current brand appearances are preserved; system-wide adaptive light/dark themes are not newly claimed.

The native dependency requires a new native build. JavaScript/assets export and browser tests cannot establish installed iOS Liquid Glass appearance, physical launcher rendering, gesture timing, VoiceOver/TalkBack usability, battery consumption or FPS.

## Research applied

- [Apple HIG materials](https://developer.apple.com/design/human-interface-guidelines/materials.md): reserve glass for the functional control/navigation layer; use regular material where legibility matters and respect accessibility settings.
- [Apple HIG app icons](https://developer.apple.com/design/human-interface-guidelines/app-icons.md): unmasked artwork, a clear central identity, small-size legibility and meaningful independent layers. Static dimensional artwork is not described as Icon Composer output.
- [Android adaptive icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive): background/foreground separation, launcher masking and safe central content.
- [Expo 58 GlassEffect](https://docs.expo.dev/versions/v58.0.0/sdk/glass-effect/): both runtime capability checks, native regular material and the platform API.
- [React Native AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo): live transparency, darker-color and inversion preferences, with cleanup of event subscriptions.

Earlier Apple app, HIG, WWDC and award studies remain in `project/native-design-execution/APPLE_NATIVE_STUDY.md` and `project/APPLE_DESIGN_RESEARCH.md`. No native device research or award recognition is inferred from those documents.

## Asset briefs and verification

The portable asset registry is `brand-assets/dimensional-icons.json`. Each asset identifies its concept, material brief, generation origin, PNG mode/dimensions and SHA-256. Its purpose is app recognition; emotional direction varies by brand rather than applying one glossy construction to five symbols. Artwork is never used to impersonate operational results. iOS originals are opaque and full bleed; Android foregrounds preserve transparency and mask margins. Original generated files are retained outside the repository too.

`node mobile/scripts/check-dimensional-icons.cjs --report` reads the actual PNGs without editing them. It verifies provenance hashes, dimensions, RGB/RGBA formats, transparent frame and silhouette geometry. Core means alpha ≥128: all such pixels fit the default 72dp circular mask; at least 99.9% fit the 66dp safe circle. The Munagasah adaptive foreground was reframed after a safe-area failure; the check was kept unchanged rather than relaxed. This geometric check is not expert originality approval or physical-device acceptance.

The comparison page shows iOS artwork and browser approximations of Android circle/squircle masks at several sizes. These are previews of the real asset files, not screenshots of installed launchers. Individual images have not been scaled or retouched by the verification script.

## Verification checkpoint

- 251 Python tests and portfolio consistency checks passed.
- 92 mobile tests, TypeScript typecheck and ESLint passed.
- All 25 standalone configurations passed; first-five configurations point to separate launcher and Android foreground assets.
- Five actual Web drawer navigation cases passed: opening, all five tab controls, navigation and closing, with no console warnings or errors. This checks the solid Web fallback, not an Android emulator or native iOS rendering.
- Native material eligibility tests cover Android/Web exclusion, missing runtime support, unknown preferences, reduced transparency, enhanced contrast and inversion.
- The icon comparison page loaded all 61 displayed image samples; its screenshot is `icon-review.png`. PNG geometry checks read the real files and match the registry hashes.

No new Groq/model inference, deployment, official action or native-device acceptance was performed. Existing historical synthetic RAG evidence is preserved. The remaining 20 dimensional icon systems, complete primary-screen transformations, editable Icon Composer layers, adaptive appearances and physical-device review remain open work.

Iqamah refinement: the user selected white for the launcher background. Both the opaque artwork and Android adaptive background now use white; the travertine portal and burgundy glass remain the brand centerpiece. Android uses `#FFFFFF` explicitly rather than inheriting the ivory in-app reading surface.

Munagasah selection: the user rejected the envelope and abstract metallic emblem and approved the institutional folio with ivory cover, graphite spine and amber seal. Its transparent `dimensional-logo.png` is now used by the in-app brand signature. The separate adaptive foreground has additional padding; the opaque launcher artwork keeps the graphite background. Concept approval is recorded separately from technical and physical-device acceptance.

Approved-branding checkpoint: 92 mobile and 251 Python tests passed after applying the Munagasah folio to the interface and launcher assets. Typecheck, lint, all 25 configurations, PNG geometry and the five Web navigation cases also passed. The new transparent brand logo is validated separately from its padded adaptive foreground.
