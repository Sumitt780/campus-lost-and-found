// ==========================================================
//                     DARK MODE
// ==========================================================

const themeToggle =
    document.getElementById("themeToggle");


// ==========================================================
//                  LOAD SAVED THEME
// ==========================================================

const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );
}


// ==========================================================
//                    UPDATE ICON
// ==========================================================

function updateThemeIcon() {

    if (!themeToggle) {
        return;
    }


    if (
        document.body.classList.contains(
            "dark-mode"
        )
    ) {

        themeToggle.textContent = "☀️";

        themeToggle.title =
            "Switch to Light Mode";

    } else {

        themeToggle.textContent = "🌙";

        themeToggle.title =
            "Switch to Dark Mode";
    }
}


// ==========================================================
//                       TOGGLE
// ==========================================================

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );


            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );


            localStorage.setItem(
                "theme",
                isDark
                    ? "dark"
                    : "light"
            );


            updateThemeIcon();
        }
    );

}


// ==========================================================
//                     INITIAL ICON
// ==========================================================

updateThemeIcon();