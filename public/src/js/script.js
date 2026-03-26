document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const loader = document.getElementById('pageLoader');
  const slider = document.getElementById('slider');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevSlideButton = document.getElementById('prevSlide');
  const nextSlideButton = document.getElementById('nextSlide');
  const modal = document.getElementById('modal');
  const closeModalButton = document.getElementById('closeModal');
  const quoteForm = document.getElementById('quoteForm');
  const formFeedback = document.getElementById('formFeedback');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const serviceInput = document.getElementById('service');
  const messageInput = document.getElementById('message');
  const modalTriggers = document.querySelectorAll('[data-open-modal]');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const whatsappTargetNumber = '5514996783803';
  const toastStack = document.createElement('div');
  let previousBodyOverflow = '';
  let previousBodyPaddingRight = '';

  toastStack.className = 'toast-stack';
  document.body.appendChild(toastStack);

  let currentSlide = 0;
  let sliderIntervalId;

  function getScrollbarWidth() {
    const measure = document.createElement('div');
    measure.style.width = '100px';
    measure.style.height = '100px';
    measure.style.overflow = 'scroll';
    measure.style.position = 'absolute';
    measure.style.top = '-9999px';
    document.body.appendChild(measure);
    const width = measure.offsetWidth - measure.clientWidth;
    measure.remove();
    return width;
  }

  function setupLoaderScrollCompensation() {
    const scrollbarWidth = getScrollbarWidth();
    body.style.setProperty('--loader-scrollbar-comp', `${scrollbarWidth}px`);
  }

  function finishLoading() {
    if (!loader) return;

    setTimeout(() => {
      loader.classList.add('hidden');
      body.classList.remove('is-loading');

      setTimeout(() => {
        loader.remove();
        body.style.removeProperty('--loader-scrollbar-comp');
      }, 650);
    }, 420);
  }

  function updateSlide(index) {
    if (!slides.length || !dots.length) return;

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    updateSlide(currentSlide + 1);
  }

  function startSliderAutoplay() {
    stopSliderAutoplay();
    sliderIntervalId = setInterval(nextSlide, 5000);
  }

  function stopSliderAutoplay() {
    if (sliderIntervalId) {
      clearInterval(sliderIntervalId);
      sliderIntervalId = null;
    }
  }

  function openModal() {
    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    lockBodyScroll();
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    unlockBodyScroll();
  }

  function lockBodyScroll() {
    previousBodyOverflow = body.style.overflow;
    previousBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  function unlockBodyScroll() {
    body.style.overflow = previousBodyOverflow;
    body.style.paddingRight = previousBodyPaddingRight;
  }

  function sanitizeText(value) {
    return String(value)
      .replace(/[<>"'`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function sanitizePhone(value) {
    return String(value).replace(/\D/g, '');
  }

  function normalizeUsPhoneDigits(value) {
    const digits = sanitizePhone(value);

    if (digits.length > 10 && digits.startsWith('1')) {
      return digits.slice(1, 11);
    }

    return digits.slice(0, 10);
  }

  function hasPotentialXss(value) {
    const input = String(value);
    return /<[^>]*>|javascript:|data:text\/html|on\w+\s*=|%3c|%3e|&#x|&#/i.test(input);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function formatPhoneMask(rawDigits) {
    const digits = normalizeUsPhoneDigits(rawDigits);

    if (!digits) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function setupInputMasks() {
    if (phoneInput) {
      phoneInput.setAttribute('inputmode', 'numeric');
      phoneInput.setAttribute('maxlength', '14');

      phoneInput.addEventListener('input', () => {
        const digits = normalizeUsPhoneDigits(phoneInput.value);
        phoneInput.value = formatPhoneMask(digits);
      });
    }
  }

  function getQuotePayload() {
    const firstName = sanitizeText(firstNameInput?.value || '');
    const lastName = sanitizeText(lastNameInput?.value || '');
    const email = sanitizeText(emailInput?.value || '').toLowerCase();
    const phoneRaw = normalizeUsPhoneDigits(phoneInput?.value || '');
    const phone = formatPhoneMask(phoneRaw);
    const service = sanitizeText(serviceInput?.value || '');
    const message = sanitizeText(messageInput?.value || '');

    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      service,
      projectObjective: message
    };
  }

  function validateQuotePayload(payload) {
    const errors = [];
    const fieldsToInspect = [
      payload.firstName,
      payload.lastName,
      payload.email,
      payload.phone,
      payload.service,
      payload.projectObjective
    ];

    if (fieldsToInspect.some(hasPotentialXss)) {
      errors.push('Detectamos caracteres invalidos nos campos. Revise os dados e tente novamente.');
      return errors;
    }

    if (!payload.fullName) {
      errors.push('Informe seu nome completo para prosseguir.');
    }

    if (!isValidEmail(payload.email)) {
      errors.push('Informe um email corporativo valido.');
    }

    if (normalizeUsPhoneDigits(payload.phone).length !== 10) {
      errors.push('Informe um telefone valido no formato dos EUA.');
    }

    if (!payload.service) {
      errors.push('Selecione o tipo de servico para continuar.');
    }

    return errors;
  }

  function buildWhatsAppMessage(payload) {
    const lines = [
      '*Nova solicitacao comercial*',
      '',
      `Nome completo: ${payload.fullName || 'Nao informado'}`,
      `Email corporativo: ${payload.email || 'Nao informado'}`,
      `Telefone: ${payload.phone || 'Nao informado'}`,
      `Servico de interesse: ${payload.service || 'Nao informado'}`,
      '',
      '*Objetivo do projeto*',
      `${payload.projectObjective || 'Nao informado'}`
    ];

    return lines.join('\n');
  }

  function buildWhatsAppUrl(payload) {
    const text = encodeURIComponent(buildWhatsAppMessage(payload));
    return `https://wa.me/${whatsappTargetNumber}?text=${text}`;
  }

  function showToast({ type = 'success', title, message }) {
    const toast = document.createElement('div');
    const toastTitle = document.createElement('strong');
    const toastMessage = document.createElement('p');

    toast.className = `toast-card is-${type}`;
    toastTitle.className = 'toast-title';
    toastMessage.className = 'toast-message';
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.appendChild(toastTitle);
    toast.appendChild(toastMessage);
    toastStack.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');

      setTimeout(() => {
        toast.remove();
      }, 320);
    }, 3200);
  }

  function setupRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    revealElements.forEach(element => {
      const delay = Number(element.getAttribute('data-delay')) || 0;
      element.style.setProperty('--delay', `${delay}ms`);
      observer.observe(element);
    });
  }

  function setupSmoothAnchorNavigation() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    const header = document.querySelector('.site-header');

    function getScrollOffset() {
      const headerHeight = header ? header.offsetHeight : 0;
      return headerHeight + 10;
    }

    function scrollToAnchor(target) {
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const nextTop = Math.max(targetTop - getScrollOffset(), 0);
      window.scrollTo({ top: nextTop, behavior: 'smooth' });
    }

    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', event => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        if (targetId === '#inicio') {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });

          if (mainNav && mainNav.classList.contains('open')) {
            mainNav.classList.remove('open');
            menuToggle?.setAttribute('aria-expanded', 'false');
          }
          return;
        }

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        scrollToAnchor(target);

        if (mainNav && mainNav.classList.contains('open')) {
          mainNav.classList.remove('open');
          menuToggle?.setAttribute('aria-expanded', 'false');
        }
      });
    });

    if (window.location.hash && window.location.hash !== '#') {
      if (window.location.hash === '#inicio') {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }, 0);
        return;
      }

      const hashTarget = document.querySelector(window.location.hash);

      if (hashTarget) {
        setTimeout(() => {
          const targetTop = hashTarget.getBoundingClientRect().top + window.scrollY;
          const nextTop = Math.max(targetTop - getScrollOffset(), 0);
          window.scrollTo({ top: nextTop, behavior: 'auto' });
        }, 0);
      }
    }
  }

  if (slides.length && dots.length) {
    prevSlideButton?.addEventListener('click', () => updateSlide(currentSlide - 1));
    nextSlideButton?.addEventListener('click', () => updateSlide(currentSlide + 1));

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => updateSlide(index));
    });

    slider?.addEventListener('mouseenter', stopSliderAutoplay);
    slider?.addEventListener('mouseleave', startSliderAutoplay);
    startSliderAutoplay();
  }

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', openModal);
  });

  closeModalButton?.addEventListener('click', closeModal);

  modal?.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });

  quoteForm?.addEventListener('submit', event => {
    event.preventDefault();

    const payload = getQuotePayload();
    const errors = validateQuotePayload(payload);

    if (errors.length) {
      showToast({
        type: 'error',
        title: 'Nao foi possivel enviar',
        message: errors[0]
      });
      return;
    }

    const whatsappUrl = buildWhatsAppUrl(payload);

    const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    quoteForm.reset();
    closeModal();

    if (phoneInput) {
      phoneInput.value = '';
    }

    if (formFeedback) {
      formFeedback.textContent = '';
    }

    showToast({
      type: 'success',
      title: 'Solicitacao enviada com sucesso',
      message: 'Encaminhando seu atendimento para o WhatsApp.'
    });
  });

  menuToggle?.addEventListener('click', () => {
    if (!mainNav) return;

    const nextExpanded = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(nextExpanded));
    mainNav.classList.toggle('open', nextExpanded);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal();

      if (mainNav?.classList.contains('open')) {
        mainNav.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  window.addEventListener('load', finishLoading);

  setupLoaderScrollCompensation();
  setupInputMasks();
  setupRevealAnimations();
  setupSmoothAnchorNavigation();
});
