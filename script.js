import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
    lenis.stop(); // Lock scroll initially

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const nav = document.querySelector("nav");
    const header = document.querySelector(".header");
    const heroImg = document.querySelector(".hero-img");
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");
    const counterElement = document.querySelector(".counter");
    const h1Element = document.querySelector(".h1");

    // --- DYNAMIC TEXT SPLITTER ---
    if (h1Element) {
        const text = h1Element.textContent;
        const words = text.split(" ");
        h1Element.innerHTML = "";
        words.forEach(word => {
            const span = document.createElement("span");
            span.textContent = word + "\u00A0";
            h1Element.appendChild(span);
        });
    }

    const setCanvasSize = () => {
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        context.scale(pixelRatio, pixelRatio);
    };
    setCanvasSize();

    // --- SMART LOADER SETUP ---
    const frameCount = 209;
    const currentFrame = (index) =>
        `/Frames/frame_${(index + 1).toString().padStart(3, "0")}.jpg`;

    let images = new Array(frameCount).fill(null);
    let videoFrames = { frame: 0 };

    // We only wait for the first 50 frames to start the site (Fast Load)
    const preloadCount = 50;
    let imagesLoadedCount = 0;
    let isAnimationStarted = false;

    const loadSingleImage = (index) => {
        const img = new Image();
        img.src = currentFrame(index);
        img.onload = () => {
            images[index] = img;
            imagesLoadedCount++;

            // Update counter based on the critical batch
            if (index < preloadCount && counterElement) {
                const progress = Math.round((imagesLoadedCount / preloadCount) * 100);
                counterElement.textContent = Math.min(progress, 100);

                // If critical batch is done, start site
                if (imagesLoadedCount === preloadCount) {
                    startAnimation();
                    loadBackgroundImages(); // Load the rest silently
                }
            }
        };
        img.onerror = () => {
            // Keep going even if error
             imagesLoadedCount++;
             if (index < preloadCount && imagesLoadedCount === preloadCount) {
                 startAnimation();
                 loadBackgroundImages();
             }
        };
    };

    // 1. Load critical batch
    for (let i = 0; i < preloadCount; i++) {
        loadSingleImage(i);
    }

    // 2. Load the rest in background
    const loadBackgroundImages = () => {
        for (let i = preloadCount; i < frameCount; i++) {
            loadSingleImage(i);
        }
    };

    const render = () => {
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        const index = Math.round(videoFrames.frame);
        const img = images[index];

        if (img && img.complete && img.naturalWidth > 0) {
            const imageAspect = img.naturalWidth / img.naturalHeight;
            const canvasAspect = canvasWidth / canvasHeight;
            let drawWidth, drawHeight, drawX, drawY;

            if (imageAspect > canvasAspect) {
                drawHeight = canvasHeight;
                drawWidth = drawHeight * imageAspect;
                drawX = (canvasWidth - drawWidth) / 2;
                drawY = 0;
            } else {
                drawWidth = canvasWidth;
                drawHeight = drawWidth / imageAspect;
                drawX = 0;
                drawY = (canvasHeight - drawHeight) / 2;
            }
            context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }
    };

    const startAnimation = () => {
        if (isAnimationStarted) return;
        isAnimationStarted = true;
        render();

        const tl = gsap.timeline({
            onComplete: () => {
                lenis.start();
                document.body.style.overflow = "auto";
                setupScrollTrigger();
            }
        });

        tl.to(".counter", { duration: 0.25, opacity: 0, delay: 0.5 })
          .to(".bar", { duration: 1.5, height: 0, stagger: { amount: 0.5 }, ease: "power4.inOut" })
          .from("canvas", { duration: 2, y: 100, ease: "power4.inOut" }, "-=1.5")
          .from(".h1 span", { duration: 1.5, y: 150, opacity: 0, stagger: 0.1, ease: "power4.out" }, "-=1.0")
          .from(".header p", { duration: 1, y: 20, opacity: 0, ease: "power2.out" }, "-=1.0")
          .from(".client-logo", { duration: 1, y: 20, opacity: 0, stagger: 0.1, ease: "power2.out" }, "-=0.8");
    };

    const setupScrollTrigger = () => {
        ScrollTrigger.create({
            trigger: ".hero",
            start: "top top",
            end: `+=${window.innerHeight * 7}px`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                const animationProgress = Math.min(progress / 0.9, 1);
                const targetFrame = Math.round(animationProgress * (frameCount - 1));
                videoFrames.frame = targetFrame;
                render();

                if(progress <= 0.1) {
                    const navProgress = progress / 0.1;
                    gsap.set(nav, {opacity: 1 - navProgress });
                } else {
                    gsap.set(nav, {opacity: 0});
                }

                if (progress <= 0.25) {
                    const zProgress = progress / 0.25;
                    const translateZ = zProgress * -500;
                    let opacity = 1;
                    if (progress >= 0.2) {
                        const fadeProgress = Math.min((progress - 0.2) / (0.25 - 0.2), 1);
                        opacity = 1 - fadeProgress;
                    }
                    gsap.set(header, {
                        transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
                        opacity,
                    });
                } else {
                    gsap.set(header, {opacity: 0});
                }

                if (progress < 0.6) {
                    gsap.set(heroImg, { transform: "translateZ(1000px)", opacity: 0 });
                } else if (progress >= 0.6 && progress <= 0.9) {
                    const imgProgress = (progress - 0.6) / 0.3;
                    const translateZ = 1000 - imgProgress * 1000;
                    let opacity = progress <= 0.8 ? (progress - 0.6) / 0.2 : 1;
                    gsap.set(heroImg, { transform: `translateZ(${translateZ}px)`, opacity });
                } else {
                    gsap.set(heroImg, { transform: "translateZ(0px)", opacity: 1 });
                }
            },
        });
    };

    window.addEventListener("resize", () => {
        setCanvasSize();
        render();
        ScrollTrigger.refresh();
    });

    // --- MOBILE MENU LOGIC ---
    const hamburger = document.querySelector(".hamburger");
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-nav-links a");
    let isMenuOpen = false;

    if (hamburger && mobileMenu) {
        const menuTl = gsap.timeline({ paused: true });

        // Timeline: Slide Menu Down -> Fade In Links
        menuTl.to(mobileMenu, {
            yPercent: 100, // Slides from -100% (hidden) to 0% (visible)
            opacity: 1,
            duration: 0.8,
            ease: "power4.inOut",
            pointerEvents: "all"
        })
        .to(mobileLinks, {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.4");

        hamburger.addEventListener("click", () => {
            if (!isMenuOpen) {
                menuTl.play();
                // Turn Hamburger into X
                gsap.to(".line-1", { rotate: 45, y: 4, background: "#241910" });
                gsap.to(".line-2", { rotate: -45, y: -4, background: "#241910" });
            } else {
                menuTl.reverse();
                // Turn X back to Hamburger
                gsap.to(".line-1", { rotate: 0, y: 0, background: "#241910" });
                gsap.to(".line-2", { rotate: 0, y: 0, background: "#241910" });
            }
            isMenuOpen = !isMenuOpen;
        });
    }
});
