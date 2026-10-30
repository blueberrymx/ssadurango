/**
 * SSA DURANGO - Servicios, Soluciones y Automatización
 * Script Principal: Interactividad, Carruseles, Desplazamiento con Barrido Lento y Cotizador WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Iconos de Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Elemento de Barrido Láser Luminoso
  let laserBeam = document.getElementById('sweep-laser');
  if (!laserBeam) {
    laserBeam = document.createElement('div');
    laserBeam.id = 'sweep-laser';
    document.body.appendChild(laserBeam);
  }

  // 3. Función de Desplazamiento Suave con Barrido Lento y Curva Easing Elegante
  function smoothScrollWithSweep(targetId, duration = 1100) {
    let targetPosition = 0;
    let targetElement = null;

    if (targetId === '#inicio' || targetId === '#') {
      targetPosition = 0;
      targetElement = document.getElementById('inicio');
    } else {
      targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      const navHeight = document.getElementById('main-nav')?.offsetHeight || 75;
      // Margen de respiro visual cómodo por ENCIMA del badge para que el texto arriba del título se lea con total claridad
      const breathingSpaceAboveBadge = window.innerWidth < 640 ? 18 : 26;

      // Localizar el badge o encabezado superior exacto de la sección de destino
      let badge = null;
      if (targetId === '#servicios') {
        badge = targetElement.querySelector('[data-catalog-badge], .catalog-badge');
      } else if (targetId === '#control-acceso') {
        badge = targetElement.querySelector('.inline-flex');
      } else {
        badge = targetElement.querySelector('[data-quote-badge], .tech-badge-dark, .inline-flex, span.uppercase');
      }

      if (badge) {
        // Posición del badge calculada con suficiente espacio superior bajo la barra fija
        const badgeRect = badge.getBoundingClientRect();
        targetPosition = badgeRect.top + window.pageYOffset - (navHeight + breathingSpaceAboveBadge);
      } else {
        const targetRect = targetElement.getBoundingClientRect();
        targetPosition = targetRect.top + window.pageYOffset - (navHeight + breathingSpaceAboveBadge);
      }
      targetPosition = Math.max(0, targetPosition);
    }

    const startPosition = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetPosition - startPosition;
    if (Math.abs(distance) < 5) return;

    let startTime = null;

    // Disparar efecto visual de barrido láser
    if (laserBeam) {
      laserBeam.classList.remove('active');
      void laserBeam.offsetWidth; // Reflow
      laserBeam.classList.add('active');
    }

    // Función de interpolación cúbica suave (Cubic EaseInOut)
    function easeInOutCubic(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t * t + b;
      t -= 2;
      return (c / 2) * (t * t * t + 2) + b;
    }

    function animationStep(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animationStep);
      } else {
        window.scrollTo(0, targetPosition);
        if (laserBeam) {
          setTimeout(() => {
            laserBeam.classList.remove('active');
          }, 200);
        }

        if (targetId === '#inicio' || targetPosition === 0) {
          // Limpiar estado activo de todos los enlaces del menú al llegar al inicio
          const desktopNavLinks = document.querySelectorAll('#desktop-nav-links .nav-link-item');
          desktopNavLinks.forEach(link => link.classList.remove('active-nav'));
          const servicesBtn = document.getElementById('services-menu-btn');
          if (servicesBtn) servicesBtn.classList.remove('active-nav');
        } else if (targetElement) {
          // Pulso sutil en la sección destino
          targetElement.classList.remove('target-section-sweep');
          void targetElement.offsetWidth;
          targetElement.classList.add('target-section-sweep');
        }
      }
    }

    requestAnimationFrame(animationStep);
  }

  // 3.1 Controladores del Menú Móvil
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('mobile-menu-icon');

  function closeMobileMenu() {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('mobile-menu-active');
      document.documentElement.classList.remove('mobile-menu-active');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      if (menuIcon) {
        menuIcon.setAttribute('data-lucide', 'menu');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  function openMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.remove('hidden');
      document.body.classList.add('mobile-menu-active');
      document.documentElement.classList.add('mobile-menu-active');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
      if (menuIcon) {
        menuIcon.setAttribute('data-lucide', 'x');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  // Aplicar desplazamiento suave cinemático a todos los enlaces de anclaje (#), incluidos logos e inicio
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        if (href === '#inicio' || href === '#') {
          e.preventDefault();
          smoothScrollWithSweep('#inicio', 1100);
          closeMobileMenu();
          return;
        }
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          smoothScrollWithSweep(href, 1100);
          closeMobileMenu();
          if (typeof setActiveNav === 'function') {
            setActiveNav(href.replace('#', ''));
          }
        }
      }
    });
  });

  // 4. Inicializar Carrusel Hero (Swiper.js)
  let isAutoplayPaused = false;
  const heroSwiper = new Swiper('.hero-swiper', {
    loop: true,
    speed: 900,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    autoplay: {
      delay: 6000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.hero-next-btn',
      prevEl: '.hero-prev-btn',
    },
    on: {
      slideChange: function () {
        // Actualizar estado activo en los botones selectores rápidos de slides
        const realIndex = this.realIndex;
        const slideButtons = document.querySelectorAll('.hero-tab-btn');
        slideButtons.forEach((btn, idx) => {
          if (idx === realIndex) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      },
      slideChangeTransitionStart: function () {
        const activeSlide = this.slides[this.activeIndex];
        if (activeSlide) {
          const animatedElements = activeSlide.querySelectorAll('.slide-animate');
          animatedElements.forEach(el => {
            el.classList.remove('revealed');
            void el.offsetWidth;
            el.classList.add('revealed');
          });
        }
      }
    }
  });

  // Botones selectores directos de cada Slide
  const slideTabs = document.querySelectorAll('.hero-tab-btn');
  slideTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const targetIndex = parseInt(tab.getAttribute('data-slide-index'), 10);
      if (!isNaN(targetIndex)) {
        heroSwiper.slideToLoop(targetIndex, 800);
      }
    });
  });

  // Botón de Pausa / Reproducción del Carrusel Hero
  const pauseBtn = document.getElementById('hero-pause-btn');
  const pauseText = document.getElementById('hero-pause-text');

  const setHeroPauseIcon = (iconName) => {
    if (!pauseBtn) return;
    const existingIcon = pauseBtn.querySelector('svg, i, [data-lucide]');
    if (existingIcon) {
      existingIcon.outerHTML = `<i id="hero-pause-icon" data-lucide="${iconName}" class="w-3.5 h-3.5"></i>`;
      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    }
  };

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      const isRunning = heroSwiper.autoplay && heroSwiper.autoplay.running;
      if (isRunning) {
        heroSwiper.autoplay.stop();
        isAutoplayPaused = true;
        if (pauseText) pauseText.textContent = 'Reanudar';
        setHeroPauseIcon('play');
        pauseBtn.classList.add('border-brand-yellowLight', 'text-brand-yellowLight');
      } else {
        heroSwiper.autoplay.start();
        isAutoplayPaused = false;
        if (pauseText) pauseText.textContent = 'Pausar';
        setHeroPauseIcon('pause');
        pauseBtn.classList.remove('border-brand-yellowLight', 'text-brand-yellowLight');
      }
    });
  }

  // 4.1 Carrusel de Servicios para Celular (< 768px)
  let servicesSwiper = null;
  const servicesSwiperEl = document.querySelector('.services-swiper');
  if (servicesSwiperEl && typeof Swiper !== 'undefined') {
    servicesSwiper = new Swiper('.services-swiper', {
      slidesPerView: 1.06,
      spaceBetween: 16,
      grabCursor: true,
      speed: 400,
      navigation: {
        nextEl: '.services-next-btn',
        prevEl: '.services-prev-btn',
      },
      pagination: {
        el: '.services-swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        768: {
          enabled: false,
        }
      }
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // 4.2 Carruseles Móviles Adicionales (< 768px): Fraccionamientos, Climas, Mantenimiento, Checador / Control Acceso, Proceso SSA y Testimonios
  const additionalMobileSwipers = [
    { selector: '.checador-swiper', next: '.checador-next-btn', prev: '.checador-prev-btn', pagination: '.checador-swiper-pagination' },
    { selector: '.fraccionamientos-swiper', next: '.fraccionamientos-next-btn', prev: '.fraccionamientos-prev-btn', pagination: '.fraccionamientos-swiper-pagination' },
    { selector: '.climas-swiper', next: '.climas-next-btn', prev: '.climas-prev-btn', pagination: '.climas-swiper-pagination' },
    { selector: '.mantenimiento-swiper', next: '.mantenimiento-next-btn', prev: '.mantenimiento-prev-btn', pagination: '.mantenimiento-swiper-pagination' },
    { selector: '.proceso-swiper', next: '.proceso-next-btn', prev: '.proceso-prev-btn', pagination: '.proceso-swiper-pagination' },
    { selector: '.testimonios-swiper', next: '.testimonios-next-btn', prev: '.testimonios-prev-btn', pagination: '.testimonios-swiper-pagination' }
  ];

  additionalMobileSwipers.forEach(cfg => {
    const swiperEl = document.querySelector(cfg.selector);
    if (swiperEl && typeof Swiper !== 'undefined') {
      new Swiper(cfg.selector, {
        slidesPerView: 1.06,
        spaceBetween: 16,
        grabCursor: true,
        speed: 400,
        navigation: {
          nextEl: cfg.next,
          prevEl: cfg.prev,
        },
        pagination: {
          el: cfg.pagination,
          clickable: true,
        },
        breakpoints: {
          768: {
            enabled: false,
          }
        }
      });
    }
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }



  // 5. Navbar Sticky Effect on Scroll
  const navbar = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('shadow-xl', 'bg-opacity-95');
    } else {
      navbar.classList.remove('shadow-xl', 'bg-opacity-95');
    }
  });

  // 5.1 Scrollspy gestionado por updateScrollSpy()
  window.setActiveNav = function() { if (typeof updateScrollSpy === "function") updateScrollSpy(); };

  // 5.2 Botón Flotante de Urgencias: Reducir a círculo con llave abajo de la sección de servicios
  const floatingRepairBtn = document.querySelector('.floating-repair-btn');
  const serviciosSection = document.getElementById('servicios');

  function updateFloatingRepairBtnState() {
    if (!floatingRepairBtn || !serviciosSection) return;
    const rect = serviciosSection.getBoundingClientRect();
    // Se compacta automáticamente desde el inicio de la sección de servicios
    if (rect.top <= 150) {
      floatingRepairBtn.classList.add('is-collapsed');
    } else {
      floatingRepairBtn.classList.remove('is-collapsed');
    }
  }

  window.addEventListener('scroll', updateFloatingRepairBtnState, { passive: true });
  updateFloatingRepairBtnState();

  // 6. Listeners de Eventos del Menú Móvil (Toggle, Clic Fuera y Escape)
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        openMobileMenu();
      } else {
        closeMobileMenu();
      }
    });

    // Cerrar al hacer clic fuera del menú
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Cerrar al presionar la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  // 7. Scroll Reveal con Intersection Observer
  const revealElements = document.querySelectorAll('.reveal-init, .reveal-left, .reveal-right, .reveal-scale');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 8. Manejo de Subida Multi-Imagen y Previsualización en el Cotizador (Hasta 4 fotos)
  const quoteImageInput = document.getElementById('quote-image');
  const uploadPrompt = document.getElementById('upload-prompt');
  const previewContainer = document.getElementById('image-preview-container');
  const multiImageGrid = document.getElementById('multi-image-grid');
  const previewCountLabel = document.getElementById('preview-count-label');
  const removeAllImagesBtn = document.getElementById('remove-all-images-btn');
  let selectedImageFiles = []; // Almacena hasta 4 elementos { file, dataUrl }

  function renderMultiImagePreviews() {
    if (!multiImageGrid) return;
    multiImageGrid.innerHTML = '';

    if (selectedImageFiles.length === 0) {
      if (previewContainer) previewContainer.classList.add('hidden');
      if (uploadPrompt) uploadPrompt.classList.remove('hidden');
      if (quoteImageInput) quoteImageInput.value = '';
      return;
    }

    if (previewContainer) previewContainer.classList.remove('hidden');
    if (previewCountLabel) {
      previewCountLabel.textContent = `Fotos seleccionadas (${selectedImageFiles.length}/4)`;
    }

    if (uploadPrompt) {
      if (selectedImageFiles.length >= 4) {
        uploadPrompt.classList.add('hidden');
      } else {
        uploadPrompt.classList.remove('hidden');
      }
    }

    selectedImageFiles.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'multi-image-card';

      const sizeInMB = (item.file.size / (1024 * 1024)).toFixed(1);
      const sizeText = item.file.size < 1024 * 1024 
        ? `${(item.file.size / 1024).toFixed(0)} KB` 
        : `${sizeInMB} MB`;

      card.innerHTML = `
        <img src="${item.dataUrl}" alt="Foto ${index + 1}">
        <button type="button" class="remove-btn" data-index="${index}" title="Eliminar foto">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
        <div class="card-info">
          <p class="text-[10px] font-bold text-[#0B2545] truncate">${item.file.name}</p>
          <p class="text-[9px] text-slate-500">${sizeText}</p>
        </div>
      `;

      const removeBtn = card.querySelector('.remove-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedImageFiles.splice(index, 1);
          renderMultiImagePreviews();
        });
      }

      multiImageGrid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function addFiles(files) {
    if (!files || files.length === 0) return;
    const remainingSlots = 4 - selectedImageFiles.length;
    if (remainingSlots <= 0) {
      alert('Solo se permite subir un máximo de 4 fotografías de referencia.');
      return;
    }

    const filesToAdd = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remainingSlots);

    let loadedCount = 0;
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImageFiles.push({
          file: file,
          dataUrl: e.target.result
        });
        loadedCount++;
        if (loadedCount === filesToAdd.length) {
          renderMultiImagePreviews();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  if (quoteImageInput) {
    quoteImageInput.addEventListener('change', (e) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
    });
  }

  if (uploadPrompt) {
    uploadPrompt.addEventListener('click', () => {
      if (quoteImageInput) quoteImageInput.click();
    });

    // Soporte para arrastrar y soltar (Drag & Drop)
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadPrompt.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadPrompt.classList.add('border-brand-orange', 'bg-orange-50/60');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadPrompt.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadPrompt.classList.remove('border-brand-orange', 'bg-orange-50/60');
      });
    });

    uploadPrompt.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt.files) {
        addFiles(dt.files);
      }
    });
  }

  if (removeAllImagesBtn) {
    removeAllImagesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedImageFiles = [];
      renderMultiImagePreviews();
    });
  }

  // 9. Calculador y Generador de Cotizaciones WhatsApp
  const quoteForm = document.getElementById('quick-quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const service = document.getElementById('quote-service')?.value || 'General';
      const type = document.getElementById('quote-type')?.value || 'Residencial';
      const name = document.getElementById('quote-name')?.value.trim() || 'Cliente';
      const notes = document.getElementById('quote-notes')?.value.trim() || 'Deseo más información y cotización.';
      
      const photoCount = selectedImageFiles.length;
      const imageText = photoCount > 0 
        ? `%0A📸 *Fotos de Referencia:* ${photoCount} imagen(es) seleccionada(s) (adjunto fotografías en este chat para evaluación técnica).` 
        : '';

      const phoneNumber = '526183032358';
      const textMessage = `¡Hola SSA Durango! 🛠️%0A%0A*SOLICITUD DE COTIZACIÓN WEB*%0A👤 *Nombre:* ${encodeURIComponent(name)}%0A🔧 *Servicio:* ${encodeURIComponent(service)}%0A🏢 *Tipo de Inmueble:* ${encodeURIComponent(type)}%0A📝 *Detalles:* ${encodeURIComponent(notes)}${imageText}%0A%0A_Enviado desde el portal web ssa-durango._`;
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${textMessage}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // 10. Formulario de Registro para Red de Aliados B2B (Herreros e Instaladores)
  const b2bForm = document.getElementById('b2b-register-form');
  if (b2bForm) {
    b2bForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('b2b-name');
      const phoneInput = document.getElementById('b2b-phone');
      const errorMsg = document.getElementById('b2b-error-msg');
      const name = nameInput?.value.trim() || '';
      const phone = phoneInput?.value.trim() || '';
      const role = document.getElementById('b2b-role')?.value || 'Herrero independiente / Taller de Herrería';
      const notes = document.getElementById('b2b-notes')?.value.trim() || 'Equipos y refacciones en general';

      // Validación limpia en JS sin cuadros de diálogo nativos del navegador ("Completa este campo")
      if (!name || !phone) {
        if (errorMsg) errorMsg.classList.remove('hidden');
        if (!name && nameInput) {
          nameInput.classList.add('border-brand-orange', 'bg-orange-50/50');
          nameInput.focus();
        } else if (!phone && phoneInput) {
          phoneInput.classList.add('border-brand-orange', 'bg-orange-50/50');
          phoneInput.focus();
        }
        return;
      }

      if (errorMsg) errorMsg.classList.add('hidden');
      if (nameInput) nameInput.classList.remove('border-brand-orange', 'bg-orange-50/50');
      if (phoneInput) phoneInput.classList.remove('border-brand-orange', 'bg-orange-50/50');

      const phoneNumber = '526183032358';
      const b2bMessage = `¡Hola SSA Durango! 🤝%0A%0A*REGISTRO RED DE ALIADOS B2B*%0A👤 *Nombre:* ${encodeURIComponent(name)}%0A🔨 *Giro / Oficio:* ${encodeURIComponent(role)}%0A📱 *WhatsApp:* ${encodeURIComponent(phone)}%0A📦 *Interés / Refacciones:* ${encodeURIComponent(notes)}%0A%0A_Deseo registrarme para recibir precios preferenciales de mayoreo y catálogo de refacciones._`;

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${b2bMessage}`;
      window.open(whatsappUrl, '_blank');

      const confirmMsg = document.getElementById('b2b-confirm-msg');
      if (confirmMsg) {
        confirmMsg.classList.remove('hidden');
      }
      b2bForm.reset();
    });
  }

  // 11. Testimonials Slider (Swiper)
  const testimonialsSwiper = new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.testimonials-pagination',
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      }
    }
  });

});

// Función global para dirigir al Cotizador Inteligente y preseleccionar el servicio
function quoteService(serviceName) {
  const quoteSection = document.getElementById('cotizador');
  const serviceSelect = document.getElementById('quote-service');
  
  if (serviceSelect && serviceName) {
    const cleanQuery = serviceName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let matchFound = false;

    for (let i = 0; i < serviceSelect.options.length; i++) {
      const optVal = serviceSelect.options[i].value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const optText = serviceSelect.options[i].text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      if (optVal.includes(cleanQuery) || cleanQuery.includes(optVal) || optText.includes(cleanQuery)) {
        serviceSelect.selectedIndex = i;
        matchFound = true;
        break;
      }
    }

    // Mapeos por palabras clave de respaldo para las 10 divisiones oficiales
    if (!matchFound) {
      if (cleanQuery.includes("mantenimiento") || cleanQuery.includes("reparacion") || cleanQuery.includes("falla") || cleanQuery.includes("diagnostico") || cleanQuery.includes("tecnico")) {
        serviceSelect.value = "Mantenimiento o Reparación Técnica";
      } else if (cleanQuery.includes("fabricacion") || cleanQuery.includes("nuevo")) {
        serviceSelect.value = "Fabricación de Portón Nuevo";
      } else if (cleanQuery.includes("automatizacion") || cleanQuery.includes("motor") || cleanQuery.includes("porton")) {
        serviceSelect.value = "Automatización de Portón Existente";
      } else if (cleanQuery.includes("celosia") || cleanQuery.includes("cnc") || cleanQuery.includes("herreria") || cleanQuery.includes("puerta")) {
        serviceSelect.value = "Herrería Residencial & Celosías CNC";
      } else if (cleanQuery.includes("fraccionamiento") || cleanQuery.includes("privada") || cleanQuery.includes("barrera") || cleanQuery.includes("rfid")) {
        serviceSelect.value = "Control de Acceso a Fraccionamientos / Privadas";
      } else if (cleanQuery.includes("comercial") || cleanQuery.includes("checador") || cleanQuery.includes("personal") || cleanQuery.includes("oficina")) {
        serviceSelect.value = "Control de Acceso Comercial & Checador de Personal";
      } else if (cleanQuery.includes("cerradura") || cleanQuery.includes("smart") || cleanQuery.includes("digital") || cleanQuery.includes("huella")) {
        serviceSelect.value = "Cerraduras Inteligentes";
      } else if (cleanQuery.includes("clima") || cleanQuery.includes("minisplit") || cleanQuery.includes("aire")) {
        serviceSelect.value = "Instalación o Servicio de Minisplit";
      } else if (cleanQuery.includes("control") || cleanQuery.includes("bateria") || cleanQuery.includes("refaccion")) {
        serviceSelect.value = "Controles, Baterías y Refacciones";
      } else {
        serviceSelect.value = "Otro Servicio / Cotización General";
      }
    }
  }

  // Desplazamiento suave con efecto láser
  const targetElement = document.querySelector('#cotizador');
  if (targetElement) {
    const navHeight = document.getElementById('main-nav')?.offsetHeight || 70;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (navHeight - 10);
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  // Foco en el campo del nombre y resplandor sutil
  setTimeout(() => {
    const nameInput = document.getElementById('quote-name');
    if (nameInput) {
      nameInput.focus();
    }
    const formCard = document.querySelector('#cotizador form');
    if (formCard) {
      formCard.classList.add('ring-4', 'ring-[#FF6600]', 'transition-all', 'duration-500', 'rounded-2xl');
      setTimeout(() => {
        formCard.classList.remove('ring-4', 'ring-[#FF6600]');
      }, 1400);
    }
  }, 700);
}



  // Manejo del Menú Desplegable de Servicios (Desktop y Touch)
  const servicesBtn = document.getElementById('services-menu-btn');
  const servicesDropdown = document.getElementById('services-dropdown-panel');
  const servicesGroup = servicesBtn?.closest('.group\\/dropdown') || servicesBtn?.parentElement;

  if (servicesBtn && servicesDropdown) {
    servicesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (servicesGroup) servicesGroup.classList.remove('dropdown-force-closed');
      servicesDropdown.classList.remove('dropdown-force-closed');
      const isOpen = servicesDropdown.classList.toggle('services-dropdown-open');
      servicesBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!servicesBtn.contains(e.target) && !servicesDropdown.contains(e.target)) {
        servicesDropdown.classList.remove('services-dropdown-open');
        servicesBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Al hacer clic en cualquier servicio del dropdown: repliegue inmediato y visibilidad limpia
    servicesDropdown.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (servicesGroup) servicesGroup.classList.add('dropdown-force-closed');
        servicesDropdown.classList.add('dropdown-force-closed');
        servicesDropdown.classList.remove('services-dropdown-open');
        servicesBtn.setAttribute('aria-expanded', 'false');
        servicesBtn.blur();
      });
    });

    // Al salir el cursor del contenedor de servicios, rehabilitar comportamiento normal
    if (servicesGroup) {
      servicesGroup.addEventListener('mouseleave', () => {
        servicesGroup.classList.remove('dropdown-force-closed');
        servicesDropdown.classList.remove('dropdown-force-closed');
      });
    }
  }

  // =========================================================================
  // SCROLLSPY INTELIGENTE: SUBRAYADO ACTIVO EXCLUSIVO POR SECCIÓN
  // =========================================================================
  const desktopNavLinks = document.querySelectorAll('#desktop-nav-links .nav-link-item');
  const servicesMenuBtn = document.getElementById('services-menu-btn');

  // Secciones que activan exclusivamente el botón desplegable de Servicios
  const serviceSectionIds = [
    'servicios',
    'portones',
    'premium-celosias',
    'fraccionamientos',
    'cerraduras',
    'control-acceso',
    'climas',
    'mantenimiento'
  ];

  function updateScrollSpy() {
    // 1. Limpiar subrayado de todos los botones
    desktopNavLinks.forEach(link => link.classList.remove('active-nav'));
    if (servicesMenuBtn) servicesMenuBtn.classList.remove('active-nav');

    // 2. Si estamos en el Hero / Inicio, ningún botón se activa
    const serviciosEl = document.getElementById('servicios');
    if (!serviciosEl) return;
    const serviciosRect = serviciosEl.getBoundingClientRect();
    if (serviciosRect.top > 180) {
      return;
    }

    // 3. Si se llegó al final de la página (Footer / Contacto)
    const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 80);
    if (isAtBottom) {
      const contactoLink = document.querySelector('#desktop-nav-links a[href="#contacto"]');
      if (contactoLink) contactoLink.classList.add('active-nav');
      return;
    }

    const focalPoint = 180;

    // 4. Sección Contacto
    const contactoEl = document.getElementById('contacto');
    if (contactoEl) {
      const r = contactoEl.getBoundingClientRect();
      if (r.top <= focalPoint && r.bottom > focalPoint) {
        const link = document.querySelector('#desktop-nav-links a[href="#contacto"]');
        if (link) link.classList.add('active-nav');
        return;
      }
    }

    // 5. Sección Cotizador (no activa botón de texto, tiene su botón CTA naranja)
    const cotizadorEl = document.getElementById('cotizador');
    if (cotizadorEl) {
      const r = cotizadorEl.getBoundingClientRect();
      if (r.top <= focalPoint && r.bottom > focalPoint) {
        return;
      }
    }

    // 6. Sección Acerca de SSA o Testimonios
    const acercaEl = document.getElementById('acerca-ssa');
    const testimoniosEl = document.getElementById('testimonios');
    let inAcerca = false;
    if (acercaEl) {
      const r = acercaEl.getBoundingClientRect();
      if (r.top <= focalPoint && r.bottom > focalPoint) inAcerca = true;
    }
    if (testimoniosEl) {
      const r = testimoniosEl.getBoundingClientRect();
      if (r.top <= focalPoint && r.bottom > focalPoint) inAcerca = true;
    }
    if (inAcerca) {
      const link = document.querySelector('#desktop-nav-links a[href="#acerca-ssa"]');
      if (link) link.classList.add('active-nav');
      return;
    }

    // 7. Sección Red de Aliados
    const redAliadosEl = document.getElementById('red-aliados');
    if (redAliadosEl) {
      const r = redAliadosEl.getBoundingClientRect();
      if (r.top <= focalPoint && r.bottom > focalPoint) {
        const link = document.querySelector('#desktop-nav-links a[href="#red-aliados"]');
        if (link) link.classList.add('active-nav');
        return;
      }
    }

    // 8. Secciones pertenecientes a Servicios
    for (const sId of serviceSectionIds) {
      const secEl = document.getElementById(sId);
      if (secEl) {
        const r = secEl.getBoundingClientRect();
        if (r.top <= focalPoint && r.bottom > focalPoint) {
          if (servicesMenuBtn) servicesMenuBtn.classList.add('active-nav');
          return;
        }
      }
    }
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  updateScrollSpy();
