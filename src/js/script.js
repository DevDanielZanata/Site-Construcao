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
  const modalTriggers = document.querySelectorAll('[data-open-modal]');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  let currentSlide = 0;
  let sliderIntervalId;

  function finishLoading() {
    if (!loader) return;

    setTimeout(() => {
      loader.classList.add('hidden');
      body.classList.remove('is-loading');

      setTimeout(() => {
        loader.remove();
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
    body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
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

    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', event => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (mainNav && mainNav.classList.contains('open')) {
          mainNav.classList.remove('open');
          menuToggle?.setAttribute('aria-expanded', 'false');
        }
      });
    });
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

    if (formFeedback) {
      formFeedback.textContent = 'Solicitacao recebida. Nossa equipe retornara em ate 24 horas.';
    }

    setTimeout(() => {
      quoteForm.reset();
      closeModal();
    }, 900);
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

  setupRevealAnimations();
  setupSmoothAnchorNavigation();
});
