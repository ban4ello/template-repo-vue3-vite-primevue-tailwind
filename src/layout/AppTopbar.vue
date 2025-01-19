<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme, appConfig } = useLayout();
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 496 496" xml:space="preserve">
          <g>
            <g>
              <g>
                <path fill="var(--primary-color)" d="M144,144H32v112h112V144z M128,240H48v-80h80V240z" />
                <path fill="var(--primary-color)" d="M272,144H160v112h112V144z M256,240h-80v-80h80V240z" />
                <path fill="var(--primary-color)" d="M144,272H32v112h112V272z M128,368H48v-80h80V368z" />
                <path fill="var(--primary-color)" d="M272,272H160v112h112V272z M256,368h-80v-80h80V368z" />
                <polygon fill="var(--primary-color)" points="80,224 96,224 96,208 112,208 112,192 96,192 96,176 80,176 80,192 64,192 64,208 80,208 			" />
                <rect fill="var(--primary-color)" x="192" y="192" width="48" height="16" />
                <polygon
                  fill="var(--primary-color)"
                  points="69.656,357.656 88,339.312 106.344,357.656 117.656,346.344 99.312,328 117.656,309.656 106.344,298.344 
				88,316.688 69.656,298.344 58.344,309.656 76.688,328 58.344,346.344 			"
                />
                <rect fill="var(--primary-color)" x="192" y="304" width="48" height="16" />
                <rect fill="var(--primary-color)" x="192" y="336" width="48" height="16" />
                <rect fill="var(--primary-color)" x="256" y="80" width="16" height="16" />
                <rect fill="var(--primary-color)" x="32" y="80" width="208" height="16" />
                <path
                  fill="var(--primary-color)"
                  d="M464,432H53.784L0.456,464l53.328,32H464c17.648,0,32-14.352,32-32S481.648,432,464,432z M384,480H58.216l-26.672-16
				l26.672-16H384V480z M416,480h-16v-32h16V480z M464,480h-32v-32h32c8.816,0,16,7.176,16,16C480,472.824,472.816,480,464,480z"
                />
                <path fill="var(--primary-color)" d="M304,48V0H0v416h304v-48h192V48H304z M288,400H16V128h272V400z M288,112H16V16h272V112z M480,352H304V64h176V352z" />
                <path
                  fill="var(--primary-color)"
                  d="M387.704,334.752l4.296,2.736l4.296-2.736C399.064,332.984,464,290.648,464,208S399.064,83.016,396.296,81.248
				L392,78.512l-4.296,2.736C384.936,83.016,320,125.352,320,208S384.936,332.984,387.704,334.752z M392.016,97.848
				c8.776,6.728,29,24.344,42.584,52.24C422.656,141.28,407.952,136,392,136c-15.912,0-30.584,5.248-42.512,14.016
				C363.08,122.224,383.256,104.592,392.016,97.848z M392,152c30.872,0,56,25.128,56,56s-25.128,56-56,56s-56-25.128-56-56
				S361.128,152,392,152z M392,280c15.912,0,30.576-5.248,42.512-14.016c-13.6,27.792-33.776,45.424-42.528,52.168
				c-8.776-6.728-29-24.344-42.584-52.24C361.344,274.72,376.048,280,392,280z"
                />
                <polygon fill="var(--primary-color)" points="384,248 400,248 400,216 432,216 432,200 400,200 400,168 384,168 384,200 352,200 352,216 384,216 			" />
              </g>
            </g>
          </g>
        </svg>

        <!-- Bridge icon -->
        <!-- <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" viewBox="0 0 502 502" xml:space="preserve" width="512" height="512">
          <g>
            <g>
              <rect x="115.576" y="111.15" style="fill: #4d93e8" width="30.727" height="159.201" />
              <rect x="115.576" y="305.533" style="fill: #4d93e8" width="30.727" height="85.318" />
              <rect x="355.697" y="305.533" style="fill: #4d93e8" width="30.727" height="85.318" />
              <rect x="355.697" y="111.15" style="fill: #4d93e8" width="30.727" height="159.201" />
              <polygon style="fill: #ccd7eb" points="386.424,270.35 355.697,270.35 146.304,270.35 115.576,270.35 10,270.35 10,305.533     115.576,305.533 146.304,305.533 355.697,305.533 386.424,305.533 492,305.533 492,270.35   " />
            </g>
            <g>
              <path d="M477.156,248.256c4.633,0.869,9.332,1.31,13.964,1.31c5.523,0,10-4.477,10-10s-4.477-10-10-10    c-3.398,0-6.856-0.325-10.276-0.967c-5.428-1.018-10.654,2.556-11.673,7.984S471.728,247.237,477.156,248.256z" />
              <path
                d="M492,260.351h-52.449v-29.086c1.995,1.456,4.018,2.866,6.091,4.183c1.663,1.056,3.518,1.56,5.352,1.56    c3.308,0,6.546-1.641,8.451-4.641c2.961-4.662,1.582-10.842-3.081-13.802c-35.837-22.759-59.911-73.46-59.911-106.535    c0-0.193-0.018-0.381-0.029-0.57v-0.309c0-5.523-4.477-10-10-10h-30.728c-5.523,0-10,4.477-10,10v0.319    c-0.01,0.187-0.028,0.371-0.028,0.561c0,43.955-42.468,79.715-94.668,79.715s-94.668-35.76-94.668-79.715    c0-0.189-0.018-0.374-0.028-0.561v-0.319c0-5.523-4.477-10-10-10h-30.728c-5.523,0-10,4.477-10,10v0.309    c-0.011,0.19-0.029,0.378-0.029,0.57c0,22.769-11.268,52.763-28.706,76.415c-11.323,15.358-34.949,41.122-65.962,41.122    c-5.523,0-10,4.477-10,10s4.477,10,10,10c18.026,0,35.915-6.542,52.449-18.868v29.653H10c-5.523,0-10,4.477-10,10v35.182    c0,5.523,4.477,10,10,10h95.576v75.318c0,5.523,4.477,10,10,10h30.728c5.523,0,10-4.477,10-10v-75.318h189.393v75.318    c0,5.523,4.477,10,10,10h30.728c5.523,0,10-4.477,10-10v-75.318H492c5.523,0,10-4.477,10-10v-35.182    C502,264.828,497.523,260.351,492,260.351z M419.551,213.179v47.171h-23.127v-79.878    C402.789,192.096,410.551,203.285,419.551,213.179z M376.424,121.149v139.201h-10.728V121.149H376.424z M345.696,168.196v92.155    h-23.567v-70.166C331.195,183.933,339.15,176.516,345.696,168.196z M260.75,211.38v29.97c0,5.523,4.477,10,10,10s10-4.477,10-10    v-33.016c7.452-1.742,14.606-4.122,21.38-7.07v59.086H240.31v-49.043c3.521,0.284,7.085,0.437,10.69,0.437    C254.284,211.745,257.534,211.617,260.75,211.38z M220.31,208.113v52.238h-20.439V222c0-5.523-4.477-10-10-10s-10,4.477-10,10    v38.351h-23.567v-92.155C171.385,187.363,193.95,201.738,220.31,208.113z M136.304,121.149v139.201h-10.728V121.149H136.304z     M83.323,212.189c3.297-3.705,6.509-7.661,9.617-11.877c4.639-6.293,8.867-12.936,12.636-19.764v79.802H83.329v-48.051    C83.329,212.262,83.323,212.226,83.323,212.189z M136.304,380.851h-10.728v-65.318h10.728V380.851z M376.424,380.851h-10.728    v-65.318h10.728V380.851z M482,295.533H20v-15.182h462V295.533z"
              />
            </g>
          </g>
        </svg> -->

        <span>{{ appConfig.companyName }}</span>
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>

        <div class="relative">
          <button
            v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            type="button"
            class="layout-topbar-action layout-topbar-action-highlight"
          >
            <i class="pi pi-palette"></i>
          </button>
          <AppConfigurator />
        </div>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-calendar"></i>
            <span>Calendar</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-inbox"></i>
            <span>Messages</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-user"></i>
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
