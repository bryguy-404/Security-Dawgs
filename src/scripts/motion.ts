// Enhance visible content only: without JavaScript every section stays readable.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
const seen = new WeakSet<HTMLElement>();
const running = new Map<HTMLElement, Animation>();
let observer: IntersectionObserver | undefined;

function reveal(element: HTMLElement) {
  seen.add(element);
  observer?.unobserve(element);
  if (reducedMotion.matches || element.contains(document.activeElement)) return;

  const animation = element.animate(
    [{ opacity: 0, translate: '0 24px' }, { opacity: 1, translate: '0 0' }],
    {
      duration: 680,
      delay: Math.min(Number(element.dataset.delay) || 0, 200),
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'backwards',
    },
  );
  running.set(element, animation);
  animation.onfinish = animation.oncancel = () => running.delete(element);
}

function configureMotion() {
  observer?.disconnect();
  for (const animation of running.values()) animation.cancel();
  running.clear();
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) reveal(entry.target as HTMLElement);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

  for (const element of reveals) {
    if (!seen.has(element)) observer.observe(element);
  }
}

// Keyboard navigation must never land on a fading or delayed control.
document.addEventListener('focusin', (event) => {
  if (!(event.target instanceof Element)) return;
  const element = event.target.closest<HTMLElement>('[data-reveal]');
  if (element) {
    seen.add(element);
    observer?.unobserve(element);
    running.get(element)?.cancel();
  }
});

reducedMotion.addEventListener('change', configureMotion);
configureMotion();
