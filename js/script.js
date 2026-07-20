"use strict";

/* ========================================
   ELEMENTS
======================================== */

const documentElement = document.documentElement;
const siteHeader = document.querySelector(".site-header");

const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeText = document.querySelector(".theme-text");

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

const navigationLinks = Array.from(
    document.querySelectorAll(
        '#primary-navigation a[href^="#"]'
    )
);

const sections = navigationLinks
    .map((link) => {
        const sectionId = link.getAttribute("href");
        return document.querySelector(sectionId);
    })
    .filter(Boolean);

const backToTopButton = document.querySelector(".back-to-top");

const themeStorageKey = "virtual-cv-theme";


/* ========================================
   THEME
======================================== */

function getSavedTheme() {
    try {
        return localStorage.getItem(themeStorageKey);
    } catch (error) {
        return null;
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
        console.warn("The selected theme could not be saved.");
    }
}

function getPreferredTheme() {
    const savedTheme = getSavedTheme();

    if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
    }

    const prefersDarkTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    return prefersDarkTheme ? "dark" : "light";
}

function applyTheme(theme) {
    const isDarkTheme = theme === "dark";

    documentElement.setAttribute("data-theme", theme);

    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-pressed",
            String(isDarkTheme)
        );

        themeToggle.setAttribute(
            "aria-label",
            isDarkTheme
                ? "Switch to light theme"
                : "Switch to dark theme"
        );
    }

    if (themeIcon) {
        themeIcon.textContent = isDarkTheme ? "☀" : "☾";
    }

    if (themeText) {
        themeText.textContent = isDarkTheme ? "Light" : "Dark";
    }
}

applyTheme(getPreferredTheme());

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const currentTheme =
            documentElement.getAttribute("data-theme");

        const newTheme =
            currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme);
        saveTheme(newTheme);
    });
}


/* ========================================
   MOBILE NAVIGATION
======================================== */

function setMenuState(isOpen) {
    if (!menuToggle || !primaryNavigation) {
        return;
    }

    primaryNavigation.classList.toggle("is-open", isOpen);
    menuToggle.classList.toggle("is-open", isOpen);

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    menuToggle.setAttribute(
        "aria-label",
        isOpen
            ? "Close navigation menu"
            : "Open navigation menu"
    );
}

if (menuToggle && primaryNavigation) {
    menuToggle.addEventListener("click", () => {
        const isCurrentlyOpen =
            menuToggle.getAttribute("aria-expanded") === "true";

        setMenuState(!isCurrentlyOpen);
    });

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            setMenuState(false);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuState(false);
            menuToggle.focus();
        }
    });

    document.addEventListener("click", (event) => {
        const clickedInsideHeader =
            siteHeader &&
            siteHeader.contains(event.target);

        if (!clickedInsideHeader) {
            setMenuState(false);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) {
            setMenuState(false);
        }
    });
}


/* ========================================
   ACTIVE NAVIGATION LINK
======================================== */

function updateActiveNavigation() {
    if (!sections.length) {
        return;
    }

    const headerHeight = siteHeader
        ? siteHeader.offsetHeight
        : 0;

    const currentPosition =
        window.scrollY + headerHeight + 180;

    let currentSectionId = sections[0].id;

    sections.forEach((section) => {
        if (section.offsetTop <= currentPosition) {
            currentSectionId = section.id;
        }
    });

    const pageBottomReached =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 10;

    if (pageBottomReached) {
        currentSectionId = sections[sections.length - 1].id;
    }

    navigationLinks.forEach((link) => {
        const linkSectionId =
            link.getAttribute("href").replace("#", "");

        const isActive = linkSectionId === currentSectionId;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}


/* ========================================
   BACK-TO-TOP BUTTON
======================================== */

function updateBackToTopButton() {
    if (!backToTopButton) {
        return;
    }

    const shouldShowButton = window.scrollY > 600;

    backToTopButton.classList.toggle(
        "is-visible",
        shouldShowButton
    );
}

if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
        const reducedMotionPreferred =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        window.scrollTo({
            top: 0,
            behavior: reducedMotionPreferred
                ? "auto"
                : "smooth"
        });
    });
}


/* ========================================
   SCROLL AND PAGE EVENTS
======================================== */

let updateRequested = false;

function updatePageInterface() {
    updateActiveNavigation();
    updateBackToTopButton();
    updateRequested = false;
}

function requestPageUpdate() {
    if (!updateRequested) {
        window.requestAnimationFrame(updatePageInterface);
        updateRequested = true;
    }
}

window.addEventListener(
    "scroll",
    requestPageUpdate,
    { passive: true }
);

window.addEventListener(
    "resize",
    requestPageUpdate
);

window.addEventListener(
    "load",
    updatePageInterface
);

updatePageInterface();