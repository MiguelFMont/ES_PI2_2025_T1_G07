// AUTOR: Cezar Augusto Fernandez Rull - RA: 25007452

let mouseX = 0;
let mouseY = 0;
let ticking = false;

// === Captura a posição do mouse ===
document.body.addEventListener("mousemove", (event) => {
    mouseX = event.pageX;
    mouseY = event.pageY;

    if (!ticking) {
        requestAnimationFrame(() => {
            eyeCircle(mouseX, mouseY);
            mouthMovement(mouseX, mouseY);
            ticking = false;
        });
        ticking = true;
    }
});

// === Movimento dos olhos ===
function eyeCircle(x, y) {
    const pupils = document.querySelectorAll(".pupil");

    pupils.forEach((pupil) => {
        const rect = pupil.getBoundingClientRect();
        const centerX = rect.left + pupil.clientWidth / 2;
        const centerY = rect.top + pupil.clientHeight / 2;

        const rad = Math.atan2(y - centerY, x - centerX);
        const move = 5;

        const moveX = Math.cos(rad) * move;
        const moveY = Math.sin(rad) * move;

        pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
}

// === Movimento da boca ===
function mouthMovement(x, y) {
    const mouths = document.querySelectorAll(".mouth");

    mouths.forEach((mouth) => {
        const rect = mouth.getBoundingClientRect();
        const centerX = rect.left + mouth.clientWidth / 2;
        const centerY = rect.top + mouth.clientHeight / 2;

        const rad = Math.atan2(y - centerY, x - centerX);
        const move = 5;

        const moveX = Math.cos(rad) * move;
        const moveY = Math.sin(rad) * move;

        const distance = Math.hypot(x - centerX, y - centerY);
        const scale = Math.min(1.5, 1 + distance / 500);

        mouth.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
    });
}

// === Controle dos olhos com inputs ===
document.addEventListener("DOMContentLoaded", () => {
    const eyes = document.querySelectorAll(".eye");
    const emailInput = document.querySelector("#email");
    const telefoneInput = document.querySelector("#telefone");
    const nameInput = document.querySelector("#name");
    const passwordInput = document.querySelector("#password");
    const mouths = document.querySelectorAll(".mouth");

    const setEyeState = (state) => {
        eyes.forEach((eye) => {
            eye.classList.remove("closed", "look-right");
            if (state) eye.classList.add(state);
        });
    };

    const setMouthState = (state) => {
        mouths.forEach((mouth) => {
            mouth.classList.remove("closed");
            if (state) mouth.classList.add(state);
        });
    }

    if (passwordInput) passwordInput.addEventListener("focus", () => setEyeState("closed"));
    [emailInput, nameInput, telefoneInput].forEach((input) => {
        if (input) input.addEventListener("focus", () => setEyeState("look-right"));
    });

    if (passwordInput) passwordInput.addEventListener("focus", () => setMouthState("closed"));
    [emailInput, nameInput, telefoneInput].forEach((input) => {
        if (input) input.addEventListener("focus", () => setMouthState());
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest("input")) setEyeState();
        if  (!e.target.closest("input")) setMouthState();
    });
});

// === Animação de entrada dos monstros ===
document.addEventListener("DOMContentLoaded", () => {
    const monster1 = document.querySelector(".monsterOne");
    const monster2 = document.querySelector(".monsterTwo");
    const monster3 = document.querySelector(".monsterThree");

    if (monster1) setTimeout(() => monster1.classList.add("enter-top"), 100);
    if (monster2) setTimeout(() => monster2.classList.add("enter-bottom"), 400);
    if (monster3) setTimeout(() => monster3.classList.add("enter-left"), 700);

});