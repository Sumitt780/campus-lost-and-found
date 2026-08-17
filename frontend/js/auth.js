// ==========================================================
//                         API URL
// ==========================================================

const API_URL = "http://localhost:5000/api";


// ==========================================================
//                         REGISTER
// ==========================================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const message =
                document.getElementById("message");


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.innerHTML = `
                        <div class="alert alert-danger">
                            ${data.message}
                        </div>
                    `;

                    return;
                }


                message.innerHTML = `
                    <div class="alert alert-success">
                        Registration successful!
                        Redirecting to login...
                    </div>
                `;


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1500);


            } catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );


                message.innerHTML = `
                    <div class="alert alert-danger">
                        Unable to connect to server.
                    </div>
                `;

            }

        }
    );

}


// ==========================================================
//                           LOGIN
// ==========================================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const message =
                document.getElementById("message");


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.innerHTML = `
                        <div class="alert alert-danger">
                            ${data.message}
                        </div>
                    `;

                    return;
                }


                // Save JWT token

                localStorage.setItem(
                    "token",
                    data.token
                );


                // Save user information

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                message.innerHTML = `
                    <div class="alert alert-success">
                        Login successful!
                        Redirecting...
                    </div>
                `;


                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 1000);


            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                message.innerHTML = `
                    <div class="alert alert-danger">
                        Unable to connect to server.
                    </div>
                `;

            }

        }
    );

}


// ==========================================================
//                       PROTECT PAGE
// ==========================================================

function protectPage() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return false;
    }


    return true;
}