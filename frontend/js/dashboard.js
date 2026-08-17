// ==========================================================
//                  PROTECT DASHBOARD
// ==========================================================

if (typeof protectPage === "function") {
    if (!protectPage()) {
        throw new Error("Unauthorized access");
    }
}


// ==========================================================
//                       API CONFIG
// ==========================================================

const DASHBOARD_API_URL = "http://localhost:5000/api";


// ==========================================================
//                       ELEMENTS
// ==========================================================

const itemsContainer =
    document.getElementById("itemsContainer");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const locationFilter =
    document.getElementById("locationFilter");


// ==========================================================
//                         USER
// ==========================================================

let user = null;

try {
    user = JSON.parse(
        localStorage.getItem("user") || "null"
    );
} catch (error) {
    console.error("User data error:", error);
}


// ==========================================================
//                       ADMIN CHECK
// ==========================================================

const isAdmin =
    user && user.role === "admin";


// ==========================================================
//                    SHOW USER NAME
// ==========================================================

if (user) {

    const userName =
        document.getElementById("userName");

    if (userName) {
        userName.textContent =
            `Hi, ${user.name || "Student"}`;
    }
}


// ==========================================================
//                         LOGOUT
// ==========================================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "index.html";
        }
    );
}


// ==========================================================
//                       LOAD ITEMS
// ==========================================================

async function loadItems() {

    try {

        if (loading) {
            loading.classList.remove("d-none");
        }

        if (emptyState) {
            emptyState.classList.add("d-none");
        }

        if (itemsContainer) {
            itemsContainer.innerHTML = "";
        }


        const search =
            searchInput
                ? searchInput.value.trim()
                : "";

        const type =
            typeFilter
                ? typeFilter.value
                : "";

        const category =
            categoryFilter
                ? categoryFilter.value
                : "";

        const location =
            locationFilter
                ? locationFilter.value.trim()
                : "";


        const params =
            new URLSearchParams();


        if (search) {
            params.append("search", search);
        }

        if (type) {
            params.append("type", type);
        }

        if (category) {
            params.append("category", category);
        }

        if (location) {
            params.append("location", location);
        }


        const queryString =
            params.toString();


        const url =
            queryString
                ? `${DASHBOARD_API_URL}/items?${queryString}`
                : `${DASHBOARD_API_URL}/items`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        console.log(
            "Items API response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load items"
            );
        }


        if (loading) {
            loading.classList.add("d-none");
        }


        if (
            !data.items ||
            data.items.length === 0
        ) {

            if (emptyState) {
                emptyState.classList.remove("d-none");
            }

            return;
        }


        if (itemsContainer) {

            data.items.forEach(
                item => {

                    itemsContainer.innerHTML +=
                        createItemCard(item);
                }
            );
        }


    } catch (error) {

        console.error(
            "Load Items Error:",
            error
        );


        if (loading) {
            loading.classList.add("d-none");
        }


        if (itemsContainer) {

            itemsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <strong>
                            Unable to load items.
                        </strong>
                        <br>
                        ${escapeHTML(error.message)}
                    </div>
                </div>
            `;
        }
    }
}


// ==========================================================
//                    CREATE ITEM CARD
// ==========================================================

function createItemCard(item) {

    const badgeClass =
        item.type === "Lost"
            ? "bg-danger"
            : "bg-success";


    const imageHTML =
        item.image

            ? `
                <img
                    src="http://localhost:5000${item.image}"
                    class="card-img-top item-image"
                    alt="${escapeHTML(item.title)}"
                    onerror="this.style.display='none'"
                >
            `

            : `
                <div class="no-image">
                    📦
                </div>
            `;


    const adminDeleteButton =
        isAdmin

            ? `
                <button
                    type="button"
                    class="btn btn-danger w-100 mt-2"
                    onclick="adminDeleteItem('${item._id}')"
                >
                    🗑️ Remove from History
                </button>
            `

            : "";


    return `

        <div class="col-md-6 col-lg-4">

            <div class="card item-card h-100 border-0 shadow-sm">

                ${imageHTML}

                <div class="card-body">

                    <div
                        class="d-flex
                               justify-content-between
                               mb-2"
                    >

                        <span
                            class="badge ${badgeClass}"
                        >
                            ${escapeHTML(item.type)}
                        </span>

                        <span
                            class="badge bg-secondary"
                        >
                            ${escapeHTML(item.category)}
                        </span>

                    </div>


                    <h5 class="card-title fw-bold">

                        ${escapeHTML(item.title)}

                    </h5>


                    <p class="card-text text-muted">

                        ${escapeHTML(item.description)}

                    </p>


                    <p class="small mb-1">

                        📍 ${escapeHTML(item.location)}

                    </p>


                    <p class="small text-muted">

                        📅 ${
                            item.date
                                ? new Date(
                                    item.date
                                ).toLocaleDateString()
                                : "N/A"
                        }

                    </p>

                </div>


                <div
                    class="card-footer
                           bg-white
                           border-0
                           pb-3"
                >

                    <a
                        href="item.html?id=${item._id}"
                        class="btn btn-outline-primary w-100"
                    >
                        View Details
                    </a>

                    ${adminDeleteButton}

                </div>

            </div>

        </div>
    `;
}


// ==========================================================
//                       SEARCH & FILTERS
// ==========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        debounce(loadItems, 300)
    );
}


if (typeFilter) {

    typeFilter.addEventListener(
        "change",
        loadItems
    );
}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        loadItems
    );
}


if (locationFilter) {

    locationFilter.addEventListener(
        "input",
        debounce(loadItems, 300)
    );
}


// ==========================================================
//                         CLAIMS
// ==========================================================

const claimsContainer =
    document.getElementById("claimsContainer");

const claimsLoading =
    document.getElementById("claimsLoading");

const noClaims =
    document.getElementById("noClaims");


// ==========================================================
//                       LOAD CLAIMS
// ==========================================================

async function loadClaims() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        if (claimsLoading) {
            claimsLoading.classList.remove("d-none");
        }

        if (noClaims) {
            noClaims.classList.add("d-none");
        }


        const response =
            await fetch(
                `${DASHBOARD_API_URL}/claims/my-items`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Claims API response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load claims"
            );
        }


        if (claimsLoading) {
            claimsLoading.classList.add("d-none");
        }


        if (claimsContainer) {
            claimsContainer.innerHTML = "";
        }


        if (
            !data.claims ||
            data.claims.length === 0
        ) {

            if (noClaims) {
                noClaims.classList.remove("d-none");
            }

            return;
        }


        if (claimsContainer) {

            data.claims.forEach(
                claim => {

                    claimsContainer.innerHTML +=
                        createClaimCard(claim);
                }
            );
        }


    } catch (error) {

        console.error(
            "Load Claims Error:",
            error
        );


        if (claimsLoading) {
            claimsLoading.classList.add("d-none");
        }


        if (claimsContainer) {

            claimsContainer.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        Unable to load claim requests.

                        <br>

                        ${escapeHTML(error.message)}

                    </div>

                </div>

            `;
        }
    }
}


// ==========================================================
//                    CREATE CLAIM CARD
// ==========================================================

function createClaimCard(claim) {

    const itemTitle =
        claim.item?.title ||
        "Unknown Item";

    const claimantName =
        claim.claimant?.name ||
        "Unknown Student";

    const claimantEmail =
        claim.claimant?.email ||
        "No email";

    const claimMessage =
        claim.message ||
        "No message provided";

    const claimStatus =
        claim.status ||
        "Pending";


    let statusClass =
        "bg-warning text-dark";


    if (claimStatus === "Approved") {

        statusClass =
            "bg-success";

    } else if (claimStatus === "Rejected") {

        statusClass =
            "bg-danger";
    }


    let actionButtons = "";


    if (claimStatus === "Pending") {

        actionButtons = `

            <div class="d-flex gap-2 mt-3">

                <button
                    type="button"
                    class="btn btn-success flex-fill"
                    onclick="updateClaim(
                        '${claim._id}',
                        'Approved'
                    )"
                >
                    ✅ Approve
                </button>


                <button
                    type="button"
                    class="btn btn-outline-danger flex-fill"
                    onclick="updateClaim(
                        '${claim._id}',
                        'Rejected'
                    )"
                >
                    ❌ Reject
                </button>

            </div>
        `;

    } else {

        actionButtons = `

            <div class="mt-3">

                <button
                    type="button"
                    class="btn btn-outline-secondary w-100"
                    disabled
                >
                    Claim ${escapeHTML(claimStatus)}
                </button>

            </div>
        `;
    }


    return `

        <div class="col-md-6 col-lg-4">

            <div class="card border-0 shadow-sm h-100">

                <div class="card-body">

                    <div
                        class="d-flex
                               justify-content-between
                               align-items-start
                               mb-3"
                    >

                        <h5 class="fw-bold mb-0">

                            ${escapeHTML(itemTitle)}

                        </h5>


                        <span
                            class="badge ${statusClass}"
                        >

                            ${escapeHTML(claimStatus)}

                        </span>

                    </div>


                    <hr>


                    <p class="mb-1">
                        <strong>
                            👤 Claimant
                        </strong>
                    </p>


                    <p class="text-muted mb-3">

                        ${escapeHTML(claimantName)}

                        <br>

                        <small>
                            ${escapeHTML(claimantEmail)}
                        </small>

                    </p>


                    <p class="mb-1">

                        <strong>
                            💬 Claim Message
                        </strong>

                    </p>


                    <div
                        class="bg-light
                               rounded
                               p-3
                               text-muted"
                    >

                        ${escapeHTML(claimMessage)}

                    </div>


                    <div class="mt-3">

                        <p class="small mb-1">

                            📍 ${
                                escapeHTML(
                                    claim.item?.location ||
                                    "N/A"
                                )
                            }

                        </p>


                        <p class="small text-muted mb-0">

                            📅 ${
                                claim.item?.date
                                    ? new Date(
                                        claim.item.date
                                    ).toLocaleDateString()
                                    : "N/A"
                            }

                        </p>

                    </div>


                    ${actionButtons}

                </div>

            </div>

        </div>
    `;
}


// ==========================================================
//                  APPROVE / REJECT CLAIM
// ==========================================================

async function updateClaim(
    claimId,
    status
) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    const action =
        status === "Approved"
            ? "approve"
            : "reject";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} this claim?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${DASHBOARD_API_URL}/claims/${claimId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update claim"
            );
        }


        alert(
            data.message ||
            "Claim updated successfully"
        );


        await loadClaims();
        await loadItems();
        await loadMyItems();
        await loadStatistics();
        await loadNotifications();


    } catch (error) {

        console.error(
            "Update Claim Error:",
            error
        );


        alert(error.message);
    }
}


// ==========================================================
//                        MY REPORTS
// ==========================================================

const myItemsContainer =
    document.getElementById("myItemsContainer");

const myItemsLoading =
    document.getElementById("myItemsLoading");

const noMyItems =
    document.getElementById("noMyItems");


// ==========================================================
//                     LOAD MY REPORTS
// ==========================================================

async function loadMyItems() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        if (myItemsLoading) {
            myItemsLoading.classList.remove("d-none");
        }

        if (noMyItems) {
            noMyItems.classList.add("d-none");
        }


        const response =
            await fetch(
                `${DASHBOARD_API_URL}/items/my-items`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "My Reports API response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load your reports"
            );
        }


        if (myItemsLoading) {
            myItemsLoading.classList.add("d-none");
        }


        if (myItemsContainer) {
            myItemsContainer.innerHTML = "";
        }


        if (
            !data.items ||
            data.items.length === 0
        ) {

            if (noMyItems) {
                noMyItems.classList.remove("d-none");
            }

            return;
        }


        if (myItemsContainer) {

            data.items.forEach(
                item => {

                    myItemsContainer.innerHTML +=
                        createMyItemCard(item);
                }
            );
        }


    } catch (error) {

        console.error(
            "Load My Reports Error:",
            error
        );


        if (myItemsLoading) {
            myItemsLoading.classList.add("d-none");
        }


        if (myItemsContainer) {

            myItemsContainer.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        Unable to load your reports.

                        <br>

                        ${escapeHTML(error.message)}

                    </div>

                </div>

            `;
        }
    }
}


// ==========================================================
//                  CREATE MY ITEM CARD
// ==========================================================

function createMyItemCard(item) {

    let statusClass =
        "bg-primary";


    if (item.status === "Claimed") {

        statusClass =
            "bg-success";

    } else if (item.status === "Returned") {

        statusClass =
            "bg-warning text-dark";

    } else if (item.status === "Resolved") {

        statusClass =
            "bg-secondary";

    } else if (
        item.status === "Claim Requested"
    ) {

        statusClass =
            "bg-info text-dark";

    } else if (item.type === "Lost") {

        statusClass =
            "bg-danger";
    }


    const imageHTML =
        item.image

            ? `
                <img
                    src="http://localhost:5000${item.image}"
                    class="card-img-top item-image"
                    alt="${escapeHTML(item.title)}"
                    onerror="this.style.display='none'"
                >
            `

            : `
                <div class="no-image">
                    📦
                </div>
            `;


    const adminHistoryButton =
        isAdmin

            ? `
                <button
                    type="button"
                    class="btn btn-danger w-100 mt-2"
                    onclick="adminDeleteItem('${item._id}')"
                >
                    🗑️ Remove from History
                </button>
            `

            : "";


    return `

        <div class="col-md-6 col-lg-4">

            <div class="card border-0 shadow-sm h-100">

                ${imageHTML}


                <div class="card-body">

                    <div
                        class="d-flex
                               justify-content-between
                               align-items-start
                               mb-2"
                    >

                        <span
                            class="badge ${statusClass}"
                        >

                            ${escapeHTML(
                                item.status ||
                                item.type
                            )}

                        </span>


                        <span
                            class="badge bg-secondary"
                        >

                            ${escapeHTML(
                                item.category
                            )}

                        </span>

                    </div>


                    <h5 class="fw-bold">

                        ${escapeHTML(item.title)}

                    </h5>


                    <p class="text-muted">

                        ${escapeHTML(item.description)}

                    </p>


                    <p class="small mb-1">

                        📍 ${escapeHTML(item.location)}

                    </p>


                    <p class="small text-muted">

                        📅 ${
                            item.date
                                ? new Date(
                                    item.date
                                ).toLocaleDateString()
                                : "N/A"
                        }

                    </p>


                    <div
                        class="d-flex gap-2 mt-3"
                    >

                        <a
                            href="item.html?id=${item._id}"
                            class="btn btn-outline-primary flex-fill"
                        >
                            View
                        </a>


                        <a
                            href="report.html?id=${item._id}"
                            class="btn btn-outline-secondary flex-fill"
                        >
                            Edit
                        </a>


                        <button
                            type="button"
                            class="btn btn-outline-danger flex-fill"
                            onclick="deleteItem('${item._id}')"
                        >
                            Delete
                        </button>

                    </div>


                    ${createStatusButtons(item)}


                    ${adminHistoryButton}

                </div>

            </div>

        </div>
    `;
}


// ==========================================================
//                 STATUS ACTION BUTTONS
// ==========================================================

function createStatusButtons(item) {

    if (item.status === "Claimed") {

        return `

            <button
                type="button"
                class="btn btn-warning w-100 mt-2"
                onclick="updateItemStatus(
                    '${item._id}',
                    'Returned'
                )"
            >
                📦 Mark as Returned
            </button>

        `;
    }


    if (item.status === "Returned") {

        return `

            <button
                type="button"
                class="btn btn-success w-100 mt-2"
                onclick="updateItemStatus(
                    '${item._id}',
                    'Resolved'
                )"
            >
                ✅ Mark as Resolved
            </button>

        `;
    }


    return "";
}


// ==========================================================
//                  UPDATE ITEM STATUS
// ==========================================================

async function updateItemStatus(
    itemId,
    status
) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    const statusText =
        status === "Returned"
            ? "Returned"
            : "Resolved";


    const confirmed =
        confirm(
            `Are you sure you want to mark this item as ${statusText}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${DASHBOARD_API_URL}/items/${itemId}/status`,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update item status"
            );
        }


        alert(
            data.message ||
            `Item marked as ${statusText}`
        );


        await loadItems();
        await loadMyItems();
        await loadClaims();
        await loadStatistics();
        await loadNotifications();


    } catch (error) {

        console.error(
            "Update Item Status Error:",
            error
        );


        alert(
            "❌ " + error.message
        );
    }
}


// ==========================================================
//                        EDIT ITEM
// ==========================================================

function editItem(itemId) {

    window.location.href =
        `report.html?id=${itemId}`;
}


// ==========================================================
//                    DELETE OWN ITEM
// ==========================================================

async function deleteItem(itemId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this report?"
        );


    if (!confirmed) {
        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${DASHBOARD_API_URL}/items/${itemId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete item"
            );
        }


        alert(
            data.message ||
            "Item deleted successfully"
        );


        await loadMyItems();
        await loadItems();
        await loadStatistics();


    } catch (error) {

        console.error(
            "Delete Item Error:",
            error
        );


        alert(error.message);
    }
}


// ==========================================================
//              ADMIN DELETE FROM HISTORY
// ==========================================================

async function adminDeleteItem(itemId) {

    if (!isAdmin) {

        alert(
            "Admin access required."
        );

        return;
    }


    const confirmed =
        confirm(
            "⚠️ Are you sure you want to permanently remove this item from history?"
        );


    if (!confirmed) {
        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${DASHBOARD_API_URL}/items/admin/${itemId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to remove item"
            );
        }


        alert(
            data.message ||
            "Item removed from history successfully"
        );


        await loadItems();
        await loadMyItems();
        await loadClaims();
        await loadStatistics();


    } catch (error) {

        console.error(
            "Admin Delete Error:",
            error
        );


        alert(
            "❌ " + error.message
        );
    }
}


// ==========================================================
//                    DASHBOARD STATISTICS
// ==========================================================

async function loadStatistics() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        const itemsResponse =
            await fetch(
                `${DASHBOARD_API_URL}/items`
            );


        const itemsData =
            await itemsResponse.json();


        if (!itemsResponse.ok) {

            throw new Error(
                itemsData.message ||
                "Failed to load statistics"
            );
        }


        const items =
            itemsData.items || [];


        const lostCount =
            items.filter(
                item =>
                    item.type === "Lost"
            ).length;


        const foundCount =
            items.filter(
                item =>
                    item.type === "Found"
            ).length;


        const myItemsResponse =
            await fetch(
                `${DASHBOARD_API_URL}/items/my-items`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const myItemsData =
            await myItemsResponse.json();


        if (!myItemsResponse.ok) {

            throw new Error(
                myItemsData.message ||
                "Failed to load my reports count"
            );
        }


        const myReportsCount =
            myItemsData.items
                ? myItemsData.items.length
                : 0;


        const lostCountElement =
            document.getElementById(
                "lostCount"
            );


        const foundCountElement =
            document.getElementById(
                "foundCount"
            );


        const myReportsCountElement =
            document.getElementById(
                "myReportsCount"
            );


        if (lostCountElement) {
            lostCountElement.textContent =
                lostCount;
        }


        if (foundCountElement) {
            foundCountElement.textContent =
                foundCount;
        }


        if (myReportsCountElement) {
            myReportsCountElement.textContent =
                myReportsCount;
        }


    } catch (error) {

        console.error(
            "Statistics Error:",
            error
        );
    }
}


// ==========================================================
//                       NOTIFICATIONS
// ==========================================================

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );

const notificationBadge =
    document.getElementById(
        "notificationBadge"
    );

const notificationsContainer =
    document.getElementById(
        "notificationsContainer"
    );

const markAllReadBtn =
    document.getElementById(
        "markAllReadBtn"
    );


// ==========================================================
//                  LOAD NOTIFICATIONS
// ==========================================================

async function loadNotifications() {

    const token =
        localStorage.getItem("token");


    const container =
        document.getElementById(
            "notificationsContainer"
        );


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!container) {

        console.error(
            "notificationsContainer not found"
        );

        return;
    }


    if (!token) {

        container.innerHTML = `

            <div
                class="text-center text-muted p-4"
            >
                Please login to view notifications.
            </div>

        `;

        return;
    }


    // ------------------------------------------------------
    // Loading
    // ------------------------------------------------------

    container.innerHTML = `

        <div
            class="text-center text-muted p-4"
        >

            <div
                class="spinner-border
                       spinner-border-sm
                       text-primary"
                role="status"
            ></div>

            <div class="mt-2">
                Loading notifications...
            </div>

        </div>

    `;


    try {

        const response =
            await fetch(
                `${DASHBOARD_API_URL}/notifications`,
                {
                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "NOTIFICATIONS:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load notifications"
            );
        }


        // --------------------------------------------------
        // Unread badge
        // --------------------------------------------------

        const unreadCount =
            Number(
                data.unreadCount || 0
            );


        if (badge) {

            if (unreadCount > 0) {

                badge.textContent =
                    unreadCount > 99
                        ? "99+"
                        : unreadCount;

                badge.classList.remove(
                    "d-none"
                );

            } else {

                badge.textContent = "0";

                badge.classList.add(
                    "d-none"
                );
            }
        }


        // --------------------------------------------------
        // Notifications array
        // --------------------------------------------------

        const notifications =
            Array.isArray(
                data.notifications
            )
                ? data.notifications
                : [];


        // --------------------------------------------------
        // Empty state
        // --------------------------------------------------

        if (
            notifications.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="text-center text-muted p-4"
                >

                    <div
                        style="font-size:40px;"
                    >
                        🔕
                    </div>

                    <h6
                        class="mt-2 mb-1"
                    >
                        No notifications yet
                    </h6>

                    <small>
                        New claim requests and
                        updates will appear here.
                    </small>

                </div>

            `;

            return;
        }


        // --------------------------------------------------
        // Display notifications
        // --------------------------------------------------

        container.innerHTML =
            notifications
                .map(
                    notification =>
                        createNotificationHTML(
                            notification
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            "Load Notifications Error:",
            error
        );


        container.innerHTML = `

            <div
                class="text-center text-danger p-4"
            >

                <div
                    style="font-size:35px;"
                >
                    ⚠️
                </div>

                <h6 class="mt-2">
                    Unable to load notifications
                </h6>

                <small>
                    ${escapeHTML(
                        error.message
                    )}
                </small>

            </div>

        `;
    }
}


// ==========================================================
//              CREATE NOTIFICATION HTML
// ==========================================================

function createNotificationHTML(
    notification
) {

    let icon =
        "🔔";


    if (
        notification.type ===
        "CLAIM_RECEIVED"
    ) {

        icon =
            "🤝";

    } else if (
        notification.type ===
        "CLAIM_APPROVED"
    ) {

        icon =
            "✅";

    } else if (
        notification.type ===
        "CLAIM_REJECTED"
    ) {

        icon =
            "❌";

    } else if (
        notification.type ===
        "ITEM_RETURNED"
    ) {

        icon =
            "📦";

    } else if (
        notification.type ===
        "ITEM_RESOLVED"
    ) {

        icon =
            "🎉";
    }


    const message =
        notification.message ||
        "You have a new notification.";


    const date =
        notification.createdAt
            ? new Date(
                notification.createdAt
            ).toLocaleString()
            : "";


    const unreadClass =
        notification.isRead
            ? ""
            : "bg-primary bg-opacity-10";


    const notificationId =
        notification._id || "";


    const itemId =
        notification.item?._id || "";


    return `

        <div
            class="notification-item
                   ${unreadClass}
                   border-bottom
                   p-3"
            style="cursor:pointer;"
            onclick="openNotification(
                '${notificationId}',
                '${itemId}'
            )"
        >

            <div class="d-flex gap-3">

                <div
                    style="font-size:28px;"
                >
                    ${icon}
                </div>


                <div class="flex-grow-1">

                    <div
                        class="fw-semibold"
                    >

                        ${escapeHTML(
                            message
                        )}

                    </div>


                    <small
                        class="text-muted"
                    >

                        ${escapeHTML(
                            date
                        )}

                    </small>

                </div>


                ${
                    notification.isRead

                        ? ""

                        : `
                            <span
                                class="badge
                                       bg-primary
                                       align-self-start"
                            >
                                New
                            </span>
                        `
                }

            </div>

        </div>

    `;
}


// ==========================================================
//                  OPEN NOTIFICATION
// ==========================================================

async function openNotification(
    notificationId,
    itemId
) {

    await markNotificationAsRead(
        notificationId
    );


    if (itemId) {

        window.location.href =
            `item.html?id=${itemId}`;
    }
}


// ==========================================================
//               MARK ONE NOTIFICATION READ
// ==========================================================

async function markNotificationAsRead(
    notificationId
) {

    const token =
        localStorage.getItem("token");


    if (!token || !notificationId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${DASHBOARD_API_URL}/notifications/${notificationId}/read`,
                {
                    method: "PATCH",

                    headers: {

                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to mark notification as read"
            );
        }


        await loadNotifications();


    } catch (error) {

        console.error(
            "Mark Notification Error:",
            error
        );
    }
}


// ==========================================================
//              MARK ALL NOTIFICATIONS READ
// ==========================================================

async function markAllNotificationsAsRead() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        if (markAllReadBtn) {

            markAllReadBtn.disabled =
                true;

            markAllReadBtn.textContent =
                "Marking...";
        }


        const response =
            await fetch(
                `${DASHBOARD_API_URL}/notifications/read-all`,
                {
                    method: "PATCH",

                    headers: {

                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to mark all notifications as read"
            );
        }


        await loadNotifications();


    } catch (error) {

        console.error(
            "Mark All Notifications Error:",
            error
        );


        alert(error.message);


    } finally {

        if (markAllReadBtn) {

            markAllReadBtn.disabled =
                false;

            markAllReadBtn.textContent =
                "Mark all as read";
        }
    }
}


// ==========================================================
//                NOTIFICATION EVENTS
// ==========================================================

if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        () => {

            loadNotifications();
        }
    );
}


if (markAllReadBtn) {

    markAllReadBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            markAllNotificationsAsRead();
        }
    );
}


// ==========================================================
//                  AUTO REFRESH
// ==========================================================

// Check notifications every 30 seconds.

setInterval(
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadNotifications();
        }

    },
    30000
);


// ==========================================================
//                         HELPER
// ==========================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================================
//                       DEBOUNCE
// ==========================================================

function debounce(
    callback,
    delay
) {

    let timer;


    return function (...args) {

        clearTimeout(timer);


        timer =
            setTimeout(
                () =>
                    callback.apply(
                        this,
                        args
                    ),
                delay
            );
    };
}


// ==========================================================
//                       INITIAL LOAD
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Dashboard loaded successfully"
        );


        await loadItems();

        await loadClaims();

        await loadMyItems();

        await loadStatistics();

        // IMPORTANT:
        // Load notifications on page load.

        await loadNotifications();

    }
);