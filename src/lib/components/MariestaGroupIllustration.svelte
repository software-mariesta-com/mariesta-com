<!--
	Custom illustration: Mariesta as the central group hub with
	child ventures (software, hospitality, health, and more) connected around it.
-->
<svg
	class="mariesta-group-illu h-auto w-full max-w-xl lg:max-w-2xl"
	viewBox="0 0 640 560"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<radialGradient id="illu-glow" cx="50%" cy="42%" r="55%">
			<stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.22" />
			<stop offset="55%" stop-color="var(--color-primary)" stop-opacity="0.06" />
			<stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
		</radialGradient>
		<linearGradient id="illu-ground" x1="80" y1="480" x2="560" y2="520" gradientUnits="userSpaceOnUse">
			<stop stop-color="var(--color-base-300)" stop-opacity="0" />
			<stop offset="0.5" stop-color="var(--color-base-300)" stop-opacity="0.55" />
			<stop offset="1" stop-color="var(--color-base-300)" stop-opacity="0" />
		</linearGradient>
		<filter id="illu-soft" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="1.2" result="b" />
			<feMerge>
				<feMergeNode in="b" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>

	<!-- Atmosphere -->
	<ellipse class="illu-glow" cx="320" cy="250" rx="280" ry="220" fill="url(#illu-glow)" />
	<ellipse cx="320" cy="500" rx="240" ry="18" fill="url(#illu-ground)" />

	<!-- Orbit rings -->
	<ellipse
		class="illu-orbit"
		cx="320"
		cy="260"
		rx="210"
		ry="150"
		stroke="var(--color-base-content)"
		stroke-opacity="0.12"
		stroke-width="1.5"
		stroke-dasharray="6 10"
	/>
	<ellipse
		class="illu-orbit"
		cx="320"
		cy="260"
		rx="140"
		ry="100"
		stroke="var(--color-primary)"
		stroke-opacity="0.2"
		stroke-width="1.25"
	/>

	<!-- Connection spokes -->
	<g stroke="var(--color-primary)" stroke-opacity="0.35" stroke-width="1.5">
		<path class="illu-spoke" d="M320 260 L168 170" />
		<path class="illu-spoke" d="M320 260 L472 170" />
		<path class="illu-spoke" d="M320 260 L150 340" />
		<path class="illu-spoke" d="M320 260 L490 340" />
		<path class="illu-spoke" d="M320 260 L320 420" />
	</g>

	<!-- Software venture -->
	<g class="illu-node" transform="translate(118 120)">
		<rect
			width="100"
			height="100"
			rx="22"
			fill="var(--color-base-100)"
			stroke="var(--color-base-300)"
			stroke-width="2"
		/>
		<rect x="18" y="22" width="64" height="44" rx="6" fill="var(--color-base-200)" />
		<rect x="24" y="28" width="28" height="4" rx="1" fill="var(--color-primary)" fill-opacity="0.85" />
		<rect x="24" y="36" width="40" height="3" rx="1" fill="var(--color-base-content)" fill-opacity="0.25" />
		<rect x="24" y="43" width="34" height="3" rx="1" fill="var(--color-base-content)" fill-opacity="0.18" />
		<path
			d="M34 58 L42 50 L50 58 L58 46"
			stroke="var(--color-primary)"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect x="36" y="74" width="28" height="6" rx="2" fill="var(--color-base-300)" />
	</g>

	<!-- Hospitality venture -->
	<g class="illu-node" transform="translate(422 120)">
		<rect
			width="100"
			height="100"
			rx="22"
			fill="var(--color-base-100)"
			stroke="var(--color-base-300)"
			stroke-width="2"
		/>
		<!-- Building awning -->
		<path d="M18 48 H82 L74 38 H26 Z" fill="var(--color-primary)" fill-opacity="0.9" />
		<rect x="22" y="48" width="56" height="32" rx="3" fill="var(--color-base-200)" />
		<rect x="30" y="54" width="12" height="16" rx="2" fill="var(--color-base-100)" />
		<rect x="48" y="54" width="12" height="16" rx="2" fill="var(--color-base-100)" />
		<rect x="66" y="54" width="6" height="26" rx="1" fill="var(--color-base-content)" fill-opacity="0.2" />
		<!-- Plate -->
		<ellipse
			cx="50"
			cy="28"
			rx="14"
			ry="6"
			stroke="var(--color-primary)"
			stroke-width="2"
			fill="none"
		/>
		<path
			d="M40 28 Q50 34 60 28"
			stroke="var(--color-primary)"
			stroke-width="1.5"
			stroke-linecap="round"
			fill="none"
		/>
	</g>

	<!-- Health venture -->
	<g class="illu-node" transform="translate(100 290)">
		<rect
			width="100"
			height="100"
			rx="22"
			fill="var(--color-base-100)"
			stroke="var(--color-base-300)"
			stroke-width="2"
		/>
		<rect x="28" y="28" width="44" height="52" rx="6" fill="var(--color-base-200)" />
		<rect x="44" y="38" width="12" height="32" rx="2" fill="var(--color-primary)" />
		<rect x="34" y="48" width="32" height="12" rx="2" fill="var(--color-primary)" />
		<circle cx="50" cy="22" r="5" fill="var(--color-primary)" fill-opacity="0.35" />
	</g>

	<!-- More ventures -->
	<g class="illu-node" transform="translate(440 290)">
		<rect
			width="100"
			height="100"
			rx="22"
			fill="var(--color-base-100)"
			stroke="var(--color-base-300)"
			stroke-width="2"
		/>
		<circle cx="36" cy="42" r="10" fill="var(--color-base-200)" stroke="var(--color-primary)" stroke-width="2" />
		<circle cx="64" cy="42" r="10" fill="var(--color-base-200)" stroke="var(--color-base-content)" stroke-opacity="0.25" stroke-width="2" />
		<circle cx="50" cy="66" r="10" fill="var(--color-base-200)" stroke="var(--color-base-content)" stroke-opacity="0.2" stroke-width="2" />
		<path
			d="M36 42 L50 66 L64 42"
			stroke="var(--color-primary)"
			stroke-opacity="0.45"
			stroke-width="1.5"
		/>
	</g>

	<!-- Lower satellite (commerce / more) -->
	<g class="illu-node" transform="translate(280 390)">
		<rect
			width="80"
			height="80"
			rx="18"
			fill="var(--color-base-100)"
			stroke="var(--color-base-300)"
			stroke-width="2"
		/>
		<path
			d="M24 52 V28 H40 V52 M40 36 H56 V52"
			stroke="var(--color-primary)"
			stroke-width="2.5"
			stroke-linejoin="round"
			fill="none"
		/>
		<path d="M20 52 H60" stroke="var(--color-base-content)" stroke-opacity="0.25" stroke-width="2" stroke-linecap="round" />
	</g>

	<!-- Central Mariesta hub -->
	<g class="illu-hub" filter="url(#illu-soft)">
		<circle cx="320" cy="260" r="58" fill="var(--color-primary)" fill-opacity="0.15" />
		<circle cx="320" cy="260" r="46" fill="var(--color-primary)" />
		<!-- Quizles Decorative M (same glyph as favicon) -->
		<path
			class="illu-hub-mark"
			fill="var(--color-primary-content)"
			d="M348.52 282.11H326.54Q330.76 281.79 332.33 278.54Q333.56 275.93 333.76 273.2V236.59H348.45Q345.4 237.17 344.03 239.71Q342.93 241.98 342.73 244.26V273.2Q342.73 275.67 344.1 278.54Q345.53 281.4 348.52 282.11ZM306.96 241.07Q308.26 242.31 309.53 244.23Q310.8 246.15 311.25 247.09Q311.71 248.03 313.01 250.76L323.87 273.2L318.86 283.54Q303.19 250.63 300.52 245.56Q298.89 242.5 296.78 240.23Q294.67 237.95 293.69 237.33Q292.72 236.72 292.07 236.46Q299.02 236.46 302.41 238.08Q305.07 239.38 306.96 241.07ZM300.85 275.41Q301.76 278.08 303.06 279.71Q304.36 281.33 305.07 281.69Q305.79 282.05 306.31 282.11H291.48Q291.94 282.05 292.49 281.76Q293.04 281.46 294.28 279.8Q295.51 278.15 296.49 275.48Q298.89 268.85 298.89 264.42V264.36L298.96 264.29V264.88Q298.96 270.21 300.85 275.41Z"
		/>
	</g>
</svg>
