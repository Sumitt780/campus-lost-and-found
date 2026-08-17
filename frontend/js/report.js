// ==========================================================
//                  PROTECT REPORT PAGE
// ==========================================================

if (!protectPage()) {
    throw new Error("Unauthorized access");
}


// ==========================================================
//                       ELEMENTS
// ==========================================================

const reportForm =
    document.getElementById("reportForm");

const submitBtn =
    document.getElementById("submitBtn");

const message =
    document.getElementById("message");


// ==========================================================
//                         TOKEN
// ==========================================================

const token =
    localStorage.getItem("token");


// ==========================================================
//                    EDIT MODE CHECK
// ==========================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const itemId =
    urlParams.get("id");


const isEditMode =
    Boolean(itemId);


// ==========================================================
//                    LOAD EDIT ITEM
// ==========================================================

async function loadEditItem() {

    if (!isEditMode) {
        return;
    }


    try {

        submitBtn.disabled = true;

        submitBtn.textContent =
            "Loading item...";


        const response =
            await fetch(
                `${API_URL}/items/${itemId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load item"
            );

        }


        const item =
            data.item;


        // Fill form

        document.getElementById(
            "type"
        ).value =
            item.type;


        document.getElementById(
            "title"
        ).value =
            item.title;


        document.getElementById(
            "description"
        ).value =
            item.description;


        document.getElementById(
            "category"
        ).value =
            item.category;


        document.getElementById(
            "location"
        ).value =
            item.location;


        document.getElementById(
            "date"
        ).value =
            item.date
                ? item.date.substring(0, 10)
                : "";


        // Change heading if available

        const heading =
            document.getElementById(
                "reportTitle"
            );


        if (heading) {

            heading.textContent =
                "Edit Lost & Found Item";

        }


        // Change submit button

        submitBtn.textContent =
            "Update Item";


        submitBtn.disabled =
            false;


    } catch (error) {

        console.error(
            "Load Edit Item Error:",
            error
        );


        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;


        submitBtn.disabled =
            false;

    }

}


// ==========================================================
//                    SUBMIT FORM
// ==========================================================

reportForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const type =
            document
                .getElementById("type")
                .value;


        const title =
            document
                .getElementById("title")
                .value
                .trim();


        const description =
            document
                .getElementById("description")
                .value
                .trim();


        const category =
            document
                .getElementById("category")
                .value;


        const location =
            document
                .getElementById("location")
                .value
                .trim();


        const date =
            document
                .getElementById("date")
                .value;


        const imageInput =
            document.getElementById(
                "image"
            );


        // ==================================================
        //                    EDIT MODE
        // ==================================================

        if (isEditMode) {

            try {

                submitBtn.disabled =
                    true;

                submitBtn.textContent =
                    "Updating...";


                const response =
                    await fetch(
                        `${API_URL}/items/${itemId}`,
                        {
                            method: "PATCH",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body: JSON.stringify({

                                type,
                                title,
                                description,
                                category,
                                location,
                                date

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update item"
                    );

                }


                message.innerHTML = `
                    <div class="alert alert-success">
                        Item updated successfully!
                        Redirecting...
                    </div>
                `;


                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 1200);


            } catch (error) {

                console.error(
                    "Update Item Error:",
                    error
                );


                message.innerHTML = `
                    <div class="alert alert-danger">
                        ${error.message}
                    </div>
                `;


                submitBtn.disabled =
                    false;

                submitBtn.textContent =
                    "Update Item";

            }


            return;
        }


        // ==================================================
        //                    CREATE MODE
        // ==================================================

        const formData =
            new FormData();


        formData.append(
            "type",
            type
        );


        formData.append(
            "title",
            title
        );


        formData.append(
            "description",
            description
        );


        formData.append(
            "category",
            category
        );


        formData.append(
            "location",
            location
        );


        formData.append(
            "date",
            date
        );


        // Add image if selected

        if (
            imageInput &&
            imageInput.files.length > 0
        ) {

            formData.append(
                "image",
                imageInput.files[0]
            );

        }


        try {

            submitBtn.disabled =
                true;

            submitBtn.textContent =
                "Posting...";


            const response =
                await fetch(
                    `${API_URL}/items`,
                    {
                        method: "POST",

                        headers: {

                            Authorization:
                                `Bearer ${token}`

                        },

                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to post item"
                );

            }


            message.innerHTML = `
                <div class="alert alert-success">
                    Item posted successfully!
                    Redirecting...
                </div>
            `;


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1200);


        } catch (error) {

            console.error(
                "Report Item Error:",
                error
            );


            message.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message}
                </div>
            `;


            submitBtn.disabled =
                false;

            submitBtn.textContent =
                "Post Item";

        }

    }
);


// ==========================================================
//                     INITIAL LOAD
// ==========================================================

loadEditItem();