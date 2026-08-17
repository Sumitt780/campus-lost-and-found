// ==========================================================
//                  PROTECT ITEM PAGE
// ==========================================================

if (!protectPage()) {
    throw new Error("Unauthorized access");
}


// ==========================================================
//                    GET ITEM ID
// ==========================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const itemId =
    params.get("id");


// ==========================================================
//                       ELEMENTS
// ==========================================================

const loading =
    document.getElementById("loading");

const itemContainer =
    document.getElementById("itemContainer");

const errorContainer =
    document.getElementById("errorContainer");

const claimBtn =
    document.getElementById("claimBtn");

const claimForm =
    document.getElementById("claimForm");

const submitClaimBtn =
    document.getElementById("submitClaimBtn");

const cancelClaimBtn =
    document.getElementById("cancelClaimBtn");


// ==========================================================
//                    CHECK ITEM ID
// ==========================================================

if (!itemId) {

    loading.classList.add("d-none");

    errorContainer.classList.remove("d-none");

} else {

    loadItem();

}


// ==========================================================
//                       LOAD ITEM
// ==========================================================

async function loadItem() {

    try {

        const response =
            await fetch(
                `${API_URL}/items/${itemId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Item not found"
            );

        }


        const item =
            data.item;


        // ==================================================
        //                       IMAGE
        // ==================================================

        const itemImage =
            document.getElementById(
                "itemImage"
            );

        const noImage =
            document.getElementById(
                "noImage"
            );


        if (item.image) {

            itemImage.src =
                `http://localhost:5000${item.image}`;

            itemImage.classList.remove(
                "d-none"
            );

            noImage.classList.add(
                "d-none"
            );

        } else {

            itemImage.classList.add(
                "d-none"
            );

            noImage.classList.remove(
                "d-none"
            );

        }


        // ==================================================
        //                        TYPE
        // ==================================================

        const itemType =
            document.getElementById(
                "itemType"
            );


        itemType.textContent =
            item.type;


        if (item.type === "Lost") {

            itemType.className =
                "badge bg-danger";

        } else {

            itemType.className =
                "badge bg-success";

        }


        // ==================================================
        //                     CATEGORY
        // ==================================================

        document.getElementById(
            "itemCategory"
        ).textContent =
            item.category;


        // ==================================================
        //                    BASIC DETAILS
        // ==================================================

        document.getElementById(
            "itemTitle"
        ).textContent =
            item.title;


        document.getElementById(
            "itemDescription"
        ).textContent =
            item.description;


        document.getElementById(
            "itemLocation"
        ).textContent =
            item.location;


        document.getElementById(
            "itemDate"
        ).textContent =
            new Date(
                item.date
            ).toLocaleDateString();


        // ==================================================
        //                     POSTED BY
        // ==================================================

        const postedBy =
            document.getElementById(
                "itemPostedBy"
            );


        if (
            item.postedBy &&
            item.postedBy.name
        ) {

            postedBy.textContent =
                item.postedBy.name;

        } else if (
            item.postedBy &&
            item.postedBy.email
        ) {

            postedBy.textContent =
                item.postedBy.email;

        } else {

            postedBy.textContent =
                "Campus Student";

        }


        // ==================================================
        //                     ITEM STATUS
        // ==================================================

        if (
            item.status === "Claimed"
        ) {

            claimBtn.disabled =
                true;

            claimBtn.textContent =
                "✅ Item Already Claimed";

            claimBtn.classList.remove(
                "btn-primary"
            );

            claimBtn.classList.add(
                "btn-secondary"
            );

        }


        // ==================================================
        //                   SHOW ITEM
        // ==================================================

        loading.classList.add(
            "d-none"
        );

        itemContainer.classList.remove(
            "d-none"
        );


    } catch (error) {

        console.error(
            "Item Details Error:",
            error
        );


        loading.classList.add(
            "d-none"
        );

        errorContainer.classList.remove(
            "d-none"
        );

    }

}


// ==========================================================
//                  OPEN CLAIM FORM
// ==========================================================

if (claimBtn) {

    claimBtn.addEventListener(
        "click",
        () => {

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                window.location.href =
                    "login.html";

                return;

            }


            claimForm.classList.remove(
                "d-none"
            );

            claimBtn.classList.add(
                "d-none"
            );

        }
    );

}


// ==========================================================
//                  CANCEL CLAIM
// ==========================================================

if (cancelClaimBtn) {

    cancelClaimBtn.addEventListener(
        "click",
        () => {

            claimForm.classList.add(
                "d-none"
            );

            claimBtn.classList.remove(
                "d-none"
            );

        }
    );

}


// ==========================================================
//                   SUBMIT CLAIM
// ==========================================================

if (submitClaimBtn) {

    submitClaimBtn.addEventListener(
        "click",
        async () => {

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                window.location.href =
                    "login.html";

                return;

            }


            const claimMessage =
                document
                    .getElementById(
                        "claimMessage"
                    )
                    .value
                    .trim();


            if (!claimMessage) {

                alert(
                    "Please explain why this item belongs to you."
                );

                return;

            }


            try {

                submitClaimBtn.disabled =
                    true;

                submitClaimBtn.textContent =
                    "Submitting...";


                const response =
                    await fetch(
                        `${API_URL}/claims`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body: JSON.stringify({

                                itemId:
                                    itemId,

                                message:
                                    claimMessage

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to submit claim"
                    );

                }


                // ==================================================
                //                  SUCCESS MESSAGE
                // ==================================================

                const message =
                    document.getElementById(
                        "message"
                    );


                message.innerHTML = `
                    <div class="alert alert-success">
                        ✅ Claim request submitted successfully.
                    </div>
                `;


                claimForm.classList.add(
                    "d-none"
                );

                claimBtn.classList.add(
                    "d-none"
                );


            } catch (error) {

                console.error(
                    "Claim Error:",
                    error
                );


                const message =
                    document.getElementById(
                        "message"
                    );


                message.innerHTML = `
                    <div class="alert alert-danger">
                        ❌ ${error.message}
                    </div>
                `;


            } finally {

                submitClaimBtn.disabled =
                    false;

                submitClaimBtn.textContent =
                    "Submit Claim";

            }

        }
    );

}