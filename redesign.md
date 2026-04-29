This is a fantastic product vision. A 3D neurological diagnosis tool needs to balance intense technical complexity with a frictionless, focused user interface. Doctors and specialists are time-poor and suffer from high cognitive load; the app must get out of their way and let the 3D model be the star. 

As a Senior Product Designer, here is my comprehensive design specification for **MyoAtlas** (a very strong name, though I’ll offer a few alternatives), tailored perfectly to act as a master prompt for your Next.js development.

---

### **1. Product Identity & Philosophy**
**Alternative Names:** NeuroMyo, KineAtlas, MyoScan, Somatic3D. *(MyoAtlas is excellent; stick with it unless you want to emphasize the neurological aspect more).*

**Design Philosophy: "Clinical Focus"**
* **Minimalist & Immersive:** The UI should frame the 3D model, not compete with it.
* **High Contrast:** Essential for highlighting subtle muscle groups. We will use a **Dark Mode by default**, as it reduces eye strain in clinical environments and makes 3D rendering pop.
* **Tactile & Forgiving:** Interacting with 3D can be clumsy. The UI must provide 2D fallbacks (search bars, lists) to easily locate the 500+ muscles.

---

### **2. The Design System (Variables & Tokens)**

#### **Typography**
We need a highly legible, utilitarian font. **Inter** is the gold standard for dense web apps, offering excellent readability for medical terms.
* **Font Family:** `Inter`, sans-serif.
* **Scale:**
    * `Display` (App Title/Export Headers): 24px, Semi-Bold, Tracking: -0.02em.
    * `H1` (Muscle Name): 20px, Medium.
    * `H2` (Panel Headers): 14px, Semi-Bold, Uppercase, Tracking: 0.05em (Color: Muted Text).
    * `Body` (Muscle Info/Descriptions): 14px, Regular, Line-height: 1.5.
    * `Caption` (Metadata/Tooltips): 12px, Regular.

#### **Color Palette (Dark Theme)**
* **Backgrounds:**
    * `bg-canvas`: `#0F1115` (Deepest charcoal/black for the 3D scene backdrop).
    * `bg-panel`: `#181B21` (Slightly lighter for sidebars and floating panels).
    * `bg-hover`: `#232730` (For list items and button hovers).
* **Text:**
    * `text-primary`: `#F8FAFC` (Crisp white).
    * `text-secondary`: `#94A3B8` (Slate gray for descriptions).
* **Accents & Interactions:**
    * `accent-primary`: `#3B82F6` (Clinical blue. Used for active tabs, primary buttons).
    * `mesh-default`: `#E2E8F0` (Base color of the unselected 3D muscle).
    * `mesh-selected`: `#60A5FA` (Glowing blue for the selected muscle).
* **Medical Rating Scale (Crucial for visual scanning):**
    * *Note: Neurologists typically use the MRC (Medical Research Council) scale which is 0-5. I highly recommend adopting 0-5 instead of 1-5.*
    * Grade 5 (Normal): `#10B981` (Muted Emerald)
    * Grade 4 (Slight weakness): `#84CC16` (Lime)
    * Grade 3 (Moderate): `#F59E0B` (Amber)
    * Grade 2 (Severe): `#F97316` (Orange)
    * Grade 1 (Trace): `#EF4444` (Red)
    * Grade 0 (Paralysis): `#7F1D1D` (Deep Red)

---

### **3. Layout & Architecture**

The app utilizes a **Spatial Canvas Model**. The 3D viewer is strictly fixed (`100vh`, `100vw`), and UI panels float over it. 

#### **Desktop (The Workstation)**
* **Left Panel (Navigation & Search):** Width 320px. 
    * Global search bar at the top with auto-complete for muscle names/Latin terms.
    * Categorized accordion list (e.g., Head & Neck, Upper Limb, Trunk).
    * Filtering toggles (e.g., "Show only rated muscles").
* **Center (The Canvas):** * The 3D model. 
    * Floating toolbar at the bottom center (Zoom, Pan, Reset View, Toggle Skeleton/Skin).
* **Right Panel (Inspector & Rating):** Width 360px. Appears only when a muscle is selected.
    * **Header:** Muscle Name (e.g., *Biceps Brachii*).
    * **Info Section:** Origin, Insertion, Innervation, Action (clean bullet points).
    * **Action Section:** The 0-5 Rating component (large, highly clickable segmented control).
    * **Notes:** A small text area for clinical notes.
* **Top Right:** "Export Report" button (Primary Accent color).

#### **iPad/Tablet (The Clinical Companion)**
*Tablets are the primary device in exam rooms. Touch targets must be at least 44x44px.*
* **Canvas:** Full screen.
* **Panels:** The Left and Right panels become **collapsible floating sheets**.
* **Inspector:** Instead of a right sidebar, the muscle inspector becomes a **Bottom Sheet** that slides up when a muscle is tapped. It covers the bottom 30% of the screen.
* **Rating:** Swiping up on the bottom sheet expands it to reveal the rating controls and notes. 

#### **Mobile (The Quick Reference)**
*Not ideal for full diagnosis, but necessary for quick review.*
* **Layout:** Strictly vertically stacked.
* **Top 50%:** 3D Viewer (simplified controls, primarily pinch-to-zoom and swipe-to-rotate).
* **Bottom 50%:** A persistent sheet containing Search, List, and Inspector. Selecting a muscle in the 3D view snaps the bottom sheet to that muscle's info and rating scale. 

---

### **4. Key UX Workflows**

**Workflow 1: The Diagnosis Loop (Speed is key)**
1.  Doctor taps a muscle on the 3D model.
2.  The camera auto-pans and smoothly zooms to center the selected muscle. The mesh glows blue (`mesh-selected`).
3.  The right panel (or bottom sheet) instantly populates.
4.  Doctor clicks the '3' on the segmented rating control.
5.  *Crucial Feedback:* The 3D mesh permanently changes from the default color to the Grade 3 color (`#F59E0B`). This provides an instant visual heatmap of the patient's neurological state across the whole body.

**Workflow 2: The Export**
1.  Click "Export Report".
2.  A modal appears showing a clean summary table of *only* the muscles that were rated, ignoring the unrated ones.
3.  Options to add Patient ID / Date.
4.  Outputs a heavily styled, clinical PDF with a snapshot of the 3D heatmap and the tabular data.

---

### **5. Technical Implementation Notes (For your AI Prompt)**

When feeding this into Claude for Next.js generation, include these architectural directives:
* **Framework:** Next.js (App Router).
* **Styling:** Tailwind CSS (use the hex codes provided above in the `tailwind.config.ts`). Ensure `dark` class is applied globally.
* **3D Engine:** `React Three Fiber` (R3F) and `Drei`. Instruct Claude to use `<Canvas>` with `<OrbitControls>` and recommend instanced meshes or compressed GLTF formats for handling 500+ objects smoothly.
* **State Management:** `Zustand`. You will need a global store to track `selectedMuscle`, `muscleRatings` (a dictionary of muscle IDs to their 0-5 score), and `cameraPosition`.
* **UI Components:** `Radix UI` or `shadcn/ui` (perfect for clean, accessible medical grade components like Sliders, Selects, and Dialogs).

---

This framework gives you a highly professional, scalable foundation. To refine the 3D interaction specifically, how do you envision the user isolating deeper muscle layers (e.g., hiding the superficial muscles like the trapezius to rate the rhomboids underneath)?


You are absolutely right. When feeding a prompt to an AI like Claude to generate a Next.js application, ambiguity is the enemy. To get an industry-leading, premium feel, you need to define the exact geometry, spatial relationships, and interaction micro-behaviors.

Here is the hyper-granular, token-level design specification for MyoAtlas. 

---

### **1. Core Spatial & Geometry System (The 8pt Grid)**
Everything must align to a strict 8-pixel grid to maintain clinical precision and rhythm.

* **Border Radii (Corners):**
    * `rounded-sm` (4px): Used for small internal elements (tags, badges, tooltips).
    * `rounded-md` (8px): Used for interactive inputs (search bars, buttons, dropdowns).
    * `rounded-2xl` (16px): Used for the master floating panels (Left Nav, Right Inspector) and Dialog modals. This softer radius contrasts beautifully with the sharp medical context, feeling modern and approachable.
* **Panel Elevation (Glassmorphism):**
    * In a dark UI, standard drop shadows disappear. To separate UI panels from the 3D canvas, we will use a combination of translucent backgrounds, background blurs, and crisp 1px borders.
    * **Background:** `#181B21` at `85%` opacity. (Tailwind: `bg-[#181B21]/85`).
    * **Blur:** `backdrop-blur-xl` (gives the 3D model underneath a frosted glass effect).
    * **Border:** `border border-white/10` (creates a sharp, high-end 1px rim light around the panels).

---

### **2. Component-Level Specifics**

#### **A. The Search & Filter Bar (Top Left Panel)**
* **Height:** 40px (`h-10`).
* **Background:** `bg-black/50` (darker than the panel to look recessed).
* **Border:** `border border-white/5`, transitioning to `border-blue-500/50` on focus.
* **Iconography:** Lucide Icons (specifically `Search` and `Filter`). 16x16px, color: `text-slate-400`.
* **Typography:** 14px Inter, placeholder color `text-slate-500`.

#### **B. The Muscle List Item (Left Panel Accordion)**
* **Height:** 36px per row.
* **Padding:** `px-4 py-2`.
* **Default State:** Text `text-slate-300`, Background transparent.
* **Hover State:** Background `bg-white/5` (subtle highlight), `cursor-pointer`.
* **Active/Selected State:** * Background `bg-blue-500/10`.
    * Left border indicator: A 3px wide, 16px tall vertical pill on the left edge (`bg-blue-500 rounded-r-full`).
    * Text turns `text-white font-medium`.

#### **C. The 0-5 Rating Control (The Hero Component - Right Panel)**
This must be foolproof. Doctors will click this hundreds of times. Do *not* use a slider; it requires too much precision. Use a **Segmented Control**.
* **Container:** `flex w-full h-12 bg-black/40 rounded-lg p-1 border border-white/5`.
* **Segments (6 individual buttons for grades 0, 1, 2, 3, 4, 5):**
    * Flex-1 (equal width).
    * `rounded-md`.
    * **Inactive state:** `text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors`.
    * **Active states (Dynamic Coloring based on earlier palette):**
        * If '5' is clicked: Button background becomes `bg-emerald-500`, text `text-white`, with a subtle glow `shadow-[0_0_10px_rgba(16,185,129,0.3)]`.
        * If '0' is clicked: Background becomes `bg-red-900`, text `text-white`.

#### **D. The 3D Canvas Interactions (React Three Fiber Details)**
* **Hovering a Mesh:** When the mouse moves over a 3D muscle, apply a subtle emission (glow) to that specific mesh. Do not change its color, just increase its brightness by 15% so the user knows it's clickable.
* **Selecting a Mesh:**
    * The selected muscle instantly changes to `mesh-selected` (Glowing Blue `#60A5FA`).
    * Other unselected muscles drop their opacity to `30%` (Ghost mode) to bring the selected muscle into intense visual focus.
* **Camera Animation:** When a muscle is clicked from the left list, use `gsap` or react-spring to smoothly interpolate the camera's `x,y,z` position to frame the target muscle over `0.6s` with an `ease-in-out` curve.

#### **E. The Export Button (Top Right)**
* **Style:** Primary Solid.
* **Shape:** `rounded-full` (capsule shape stands out against the rectangular panels).
* **Padding:** `px-6 py-2.5`.
* **Color:** `bg-blue-600 hover:bg-blue-500`.
* **Shadow:** `shadow-lg shadow-blue-900/20`.

---

### **3. Micro-Interactions & Animation (UX Polish)**
* **Panel Entrance:** When the app loads, or when the right panel appears after selecting a muscle, it shouldn't just pop in. It should slide in slightly from the right and fade up.
    * *Spec:* `translate-x: 10px` to `0px`, `opacity: 0` to `1`, Duration: `200ms`, Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
* **Data Updates:** When a rating is clicked, briefly flash a small "check" icon or a subtle green flash in the panel header to confirm the data was saved to the global state. 

---

### **4. Recommended Next.js/Tailwind Prompt Injection**

When you prompt Claude, include this specific paragraph to lock in the aesthetic:

> *"Build the UI using Tailwind CSS. Use a strict dark mode theme. The main canvas backdrop is `#0F1115`. All floating UI panels (Left Nav, Right Inspector) must use a glassmorphism effect: `bg-[#181B21]/85 backdrop-blur-xl border border-white/10` with a `rounded-2xl` border radius. Internal cards and inputs should use `bg-black/40` and `rounded-md`. Use 'Inter' font globally. All hover states should rely on subtle background opacity shifts (e.g., `hover:bg-white/5`) rather than harsh color changes. Ensure the 3D `<Canvas>` is absolutely positioned behind all UI layers (`z-index: 0`)."*

How do you want to handle the display of multiple muscles that have been rated differently—should the 3D model persistently show all rated colors at once like a colorful heatmap, or should it revert to the default gray until the user explicitly toggles a "Review Heatmap" mode?
This is the definitive design master plan for **MyoAtlas**. This specification combines the high-level product philosophy with the granular technical tokens required for a premium, industry-leading medical application.

---

## **1. Design Philosophy: "Clinical Focus"**
The interface must be a "Glass Frame." Doctors are dealing with high-density information; the UI must frame the 3D model without competing for attention.
* **Minimalist & Immersive:** Dark mode is the default to reduce eye strain and make the 3D muscle meshes pop.
* **Tactile Precision:** Large touch/click targets (minimum 44px) to accommodate fast-paced clinical environments.
* **Persistent Context:** The user should always know which muscle is selected and its neurological status at a glance.

---

## **2. Visual Identity & Design System**

### **Typography (Inter Stack)**
* **Font:** `Inter` (Sans-serif, utilitarian, highly legible).
* **Display/Title:** 24px, Semi-Bold, Tracking -0.02em (for App Branding).
* **H1 (Muscle Name):** 20px, Medium, `#F8FAFC`.
* **H2 (Headers):** 14px, Semi-Bold, Uppercase, Tracking 0.05em, `#94A3B8`.
* **Body/Info:** 14px, Regular, Line-height 1.5, `#E2E8F0`.
* **Caption/Labels:** 12px, Regular, `#94A3B8`.

### **Color Palette (The "Midnight" System)**
| Role | Hex Code | Tailwind Equivalent |
| :--- | :--- | :--- |
| **Canvas Background** | `#0F1115` | `bg-[#0F1115]` |
| **Panel Background** | `#181B21` | `bg-[#181B21]/85` |
| **Input/Card Background** | `#000000` | `bg-black/40` |
| **Accent (Primary)** | `#3B82F6` | `bg-blue-600` |
| **Mesh (Unselected)** | `#E2E8F0` | `text-slate-200` |
| **Mesh (Selected)** | `#60A5FA` | `text-blue-400` |

### **The MRC Rating Scale (Neurological Heatmap)**
* **Grade 5 (Normal):** `#10B981` (Emerald)
* **Grade 4 (Slight):** `#84CC16` (Lime)
* **Grade 3 (Moderate):** `#F59E0B` (Amber)
* **Grade 2 (Severe):** `#F97316` (Orange)
* **Grade 1 (Trace):** `#EF4444` (Red)
* **Grade 0 (Paralysis):** `#7F1D1D` (Deep Red)

---

## **3. Component Geometry & Layout**

### **The "Glassmorphism" Spec**
All floating panels (Sidebars, Modals) must follow this rule to feel premium:
* **Corner Radius:** `rounded-2xl` (16px).
* **Effects:** `backdrop-blur-xl` + `border border-white/10`.
* **Shadow:** Subtle directional shadow `shadow-2xl shadow-black/50`.

### **Layout Architecture**
1.  **Left Sidebar (Navigation - 320px):**
    * **Search:** 40px height, `rounded-md`, recessed `bg-black/50`.
    * **Muscle List:** 36px row height. Hover: `bg-white/5`. Active: `bg-blue-500/10` with a 3px blue left-border pill.
2.  **Right Sidebar (Inspector - 360px):**
    * **Header:** Muscle name with "Pin" and "Close" icons.
    * **Rating Control:** A horizontal segmented control (6 buttons).
    * **Interactions:** Clicking a grade applies a "Glow" effect to that muscle in the 3D view using the corresponding grade color.
3.  **The Canvas (Full Screen):**
    * **Z-Index:** 0.
    * **Controls:** Floating bottom-center "pill" for Reset, Zoom, and Layer Toggle (Skin/Skeleton).

---

## **4. Adaptive Layout (Responsive)**

| Feature | Desktop (Next.js) | iPad / Tablet | Mobile |
| :--- | :--- | :--- | :--- |
| **Panels** | Fixed Left/Right | Collapsible Side Sheets | Bottom Drawer (Slide-up) |
| **3D View** | Full Width | Full Width | Top 50% of screen |
| **Navigation** | Sidebar List | Icon-only Sidebar | Floating Search Bar |
| **Rating** | Segmented Buttons | Large Touch Tiles | Scrollable Segmented Bar |

---

## **5. Technical Directives for Next.js (Claude Code Prompt)**

Use this block when generating code:

> "Build MyoAtlas using **Next.js (App Router)** and **Tailwind CSS**. 
> - **3D Rendering:** Use `React Three Fiber` and `@react-three/drei`. Implement `OrbitControls` with a 0.6s camera smoothing using `gsap` for muscle focus.
> - **State:** Use `Zustand` to manage a global `muscleRatings` object and `selectedMuscleId`.
> - **UI Components:** Use `Radix UI` primitives for the Accordion and Dialogs.
> - **Styling:** Apply a global dark theme. Panels must have `rounded-2xl`, `backdrop-blur-xl`, and `border-white/10`. 
> - **Interactive Scale:** The 0-5 rating component should be a segmented button group where the active state colorizes based on the MRC grade (Emerald to Red). 
> - **Export:** Create a utility to generate a clean, white-labeled PDF report of all non-zero ratings."

---

## **6. Micro-Interactions**
* **Mesh Hover:** Increase `emissiveIntensity` by 0.15 on the muscle mesh.
* **Selection:** Desaturate and fade all non-selected muscles to `opacity: 0.3` to create "visual isolation."
* **Success Feedback:** When a rating is saved, the "Export" button should briefly pulse with a subtle blue glow to show the report is being updated in real-time.