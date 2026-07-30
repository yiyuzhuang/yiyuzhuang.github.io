(function () {
    "use strict";

    const root = document.documentElement;
    const body = document.body;
    const validLanguages = new Set(["en", "zh"]);

    function getInitialLanguage() {
        const urlLanguage = new URLSearchParams(window.location.search).get("lang");
        if (validLanguages.has(urlLanguage)) {
            return urlLanguage;
        }

        try {
            const savedLanguage = window.localStorage.getItem("site-language");
            if (validLanguages.has(savedLanguage)) {
                return savedLanguage;
            }
        } catch (error) {
            // The site still works when storage is unavailable.
        }

        return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
    }

    function updateNavigation(language) {
        document.querySelectorAll("[data-preserve-lang]").forEach((link) => {
            const rawHref = link.getAttribute("href");
            if (!rawHref || rawHref.startsWith("http") || rawHref.startsWith("mailto:")) {
                return;
            }

            const url = new URL(rawHref, window.location.href);
            url.searchParams.set("lang", language);
            link.setAttribute("href", `${url.pathname.split("/").pop()}${url.search}`);
        });
    }

    function setLanguage(language, persist) {
        const nextLanguage = validLanguages.has(language) ? language : "en";
        root.dataset.activeLang = nextLanguage;
        root.lang = nextLanguage === "zh" ? "zh-CN" : "en";

        document.querySelectorAll(".language-toggle").forEach((button) => {
            button.textContent = nextLanguage === "en" ? "中文" : "EN";
            button.setAttribute(
                "aria-label",
                nextLanguage === "en" ? "切换为中文" : "Switch to English"
            );
        });

        if (body.dataset.titleEn && body.dataset.titleZh) {
            document.title = nextLanguage === "zh" ? body.dataset.titleZh : body.dataset.titleEn;
        }

        const description = document.querySelector('meta[name="description"]');
        if (description && body.dataset.descriptionEn && body.dataset.descriptionZh) {
            description.setAttribute(
                "content",
                nextLanguage === "zh"
                    ? body.dataset.descriptionZh
                    : body.dataset.descriptionEn
            );
        }

        updateNavigation(nextLanguage);

        if (persist) {
            try {
                window.localStorage.setItem("site-language", nextLanguage);
            } catch (error) {
                // Persistence is optional.
            }

            const url = new URL(window.location.href);
            url.searchParams.set("lang", nextLanguage);
            window.history.replaceState({}, "", url);
        }
    }

    const initialLanguage = root.dataset.activeLang || getInitialLanguage();
    setLanguage(initialLanguage, false);

    document.querySelectorAll(".language-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const nextLanguage = root.dataset.activeLang === "en" ? "zh" : "en";
            setLanguage(nextLanguage, true);
        });
    });

    const menuButton = document.querySelector(".menu-toggle");
    const siteNav = document.querySelector(".site-nav");

    if (menuButton && siteNav) {
        menuButton.addEventListener("click", () => {
            const isOpen = siteNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });

        siteNav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                siteNav.classList.remove("is-open");
                menuButton.setAttribute("aria-expanded", "false");
            });
        });
    }

    const currentPage = body.dataset.page;
    if (currentPage) {
        const currentLink = document.querySelector(`[data-nav-page="${currentPage}"]`);
        if (currentLink) {
            currentLink.setAttribute("aria-current", "page");
        }
    }

    document.querySelectorAll("[data-current-year]").forEach((element) => {
        element.textContent = String(new Date().getFullYear());
    });

    const videos = document.querySelectorAll(".project-media video");
    if (videos.length > 0) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduceMotion || !("IntersectionObserver" in window)) {
            videos.forEach((video) => {
                if (reduceMotion) {
                    video.pause();
                    video.removeAttribute("autoplay");
                }
            });
        } else {
            const videoObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const video = entry.target;
                        if (entry.isIntersecting) {
                            video.play().catch(() => {});
                        } else {
                            video.pause();
                        }
                    });
                },
                { threshold: 0.25 }
            );

            videos.forEach((video) => videoObserver.observe(video));
        }
    }
})();
