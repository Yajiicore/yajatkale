import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () =>{
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
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

    const setCanvasSize = () => {
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        context.scale(pixelRatio, pixelRatio)
    };
    setCanvasSize();

    const frameCount = 209;
    const currentFrame = (index) =>
    `/frames/frame_${(index +1).toString().padStart(3, "0")}.webp`;

    let images = [];
    let videoFrames = { frame: 0};
    let imagesToLoad = frameCount;

    const onLoad = () => {
        imagesToLoad--;

        if (!imagesToLoad) {
            render();
            setupScrollTrigger();
        }
    };

    for (let i = 0; i < frameCount ; i++) {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = function () {
            onLoad.call(this);
        };
            img.src = currentFrame(i);
            images.push(img);
    };

    const render = () => {
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        context.clearRect (0, 0, canvasWidth, canvasHeight);

        const img = images[videoFrames.frame];
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

            context.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        }
    };

});
