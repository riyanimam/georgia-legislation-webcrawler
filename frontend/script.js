// ============================================================================
// Data Management
// ============================================================================
// This file uses ES Modules (ECMAScript standard) - not CommonJS
// Loaded as: <script type="module" src="script.js"></script>

let allBills = [];
let filteredBills = [];

/**
 * Keywords mapping for categorizing bills by key issues
 */
const issueKeywords = {
    "gun-control": [
        "firearm",
        "gun",
        "weapon",
        "ammunition",
        "concealed carry",
        "background check",
        "safe storage",
    ],
    lgbtqia: [
        "lgbtq",
        "same-sex",
        "transgender",
        "gender identity",
        "sexual orientation",
        "drag",
        "non-binary",
    ],
    healthcare: [
        "healthcare",
        "health",
        "medicaid",
        "medicare",
        "insurance",
        "prescription",
        "mental health",
        "welfare",
        "disability",
    ],
    education: [
        "school",
        "education",
        "university",
        "college",
        "student",
        "teacher",
        "curriculum",
    ],
    environment: [
        "environment",
        "climate",
        "renewable",
        "energy",
        "pollution",
        "conservation",
        "wildlife",
    ],
    "criminal-justice": [
        "crime",
        "prison",
        "jail",
        "sentencing",
        "parole",
        "police",
        "law enforcement",
        "prosecution",
    ],
    taxes: ["tax", "revenue", "budget", "fiscal", "finance", "income"],
    immigration: [
        "immigration",
        "immigrant",
        "border",
        "visa",
        "citizenship",
        "alien",
    ],
    "voting-rights": [
        "vote",
        "voting",
        "election",
        "registration",
        "franchise",
        "ballot",
    ],
    reproductive: [
        "abortion",
        "reproductive",
        "pregnancy",
        "contraception",
        "planned parenthood",
        "roe",
        "fetal",
    ],
    "workers-rights": [
        "labor",
        "union",
        "worker",
        "wage",
        "employment",
        "overtime",
        "minimum wage",
        "workplace",
    ],
    "gun-violence": [
        "gun violence",
        "mass shooting",
        "shooting",
        "assault weapon",
        "magazine",
        "red flag",
        "threat assessment",
    ],
};

/**
 * Determine the key issue category for a bill based on its content
 */
function getBillIssue(bill) {
    const text =
        `${bill.caption} ${bill.sponsors} ${bill.committees} ${bill.first_reader_summary || ""}`.toLowerCase();

    for (const [issue, keywords] of Object.entries(issueKeywords)) {
        if (keywords.some((keyword) => text.includes(keyword))) {
            return issue;
        }
    }

    return null;
}

/**
 * Generate HTML tags for a bill based on relevant keywords found in its content
 */
function generateBillTags(bill) {
    const text =
        `${bill.caption} ${bill.sponsors} ${bill.committees} ${bill.first_reader_summary || ""}`.toLowerCase();
    const tags = new Set();

    // Find all matching keywords and their categories
    for (const [issue, keywords] of Object.entries(issueKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                tags.add(keyword);
            }
        }
    }

    // Convert to array and limit to top 4 tags
    const tagArray = Array.from(tags)
        .slice(0, 4)
        .map(
            (tag) =>
                `<span class="bill-tag">${tag
                    .charAt(0)
                    .toUpperCase() + tag.slice(1)}</span>`
        )
        .join("");

    return tagArray || '<span class="bill-tag">General</span>';
}


// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the application by setting up event listeners and loading data
 */
function initializeApp() {
    setupEventListeners();
    loadDataFromFile();
}

/**
 * Set up all event listeners for form controls and interactions
 */
function setupEventListeners() {
    // File input handler
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.addEventListener("change", handleFileUpload);
    }

    // Dropdown toggle handler
    const issueDropdownToggle = document.getElementById(
        "issueDropdownToggle"
    );
    const checkboxGroup = document.getElementById("issueFilter");
    if (issueDropdownToggle && checkboxGroup) {
        issueDropdownToggle.addEventListener("click", (e) => {
            e.preventDefault();
            checkboxGroup.classList.toggle("open");
            issueDropdownToggle.classList.toggle("active");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (
                !issueDropdownToggle.contains(e.target) &&
                !checkboxGroup.contains(e.target)
            ) {
                checkboxGroup.classList.remove("open");
                issueDropdownToggle.classList.remove("active");
            }
        });
    }

    // Filter and search handlers
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const issueCheckboxes = document.querySelectorAll(".issue-checkbox");
    const sortBy = document.getElementById("sortBy");
    const resetBtn = document.getElementById("resetBtn");

    if (searchInput) searchInput.addEventListener("input", filterBills);
    if (typeFilter) typeFilter.addEventListener("change", filterBills);
    issueCheckboxes.forEach((checkbox) =>
        checkbox.addEventListener("change", filterBills)
    );
    if (sortBy) sortBy.addEventListener("change", filterBills);
    if (resetBtn) resetBtn.addEventListener("click", resetFilters);

    // Modal backdrop click handler
    const modal = document.getElementById("detailModal");
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target.id === "detailModal") {
                closeModal();
            }
        });
    }
}

/**
 * Attempt to load ga_legislation.json on page load
 */
function loadDataFromFile() {
    fetch("ga_legislation.json")
        .then((response) => response.json())
        .then((data) => {
            allBills = data;
            filteredBills = [...allBills];
            updateStats();
            renderBills();
            document.getElementById("fileInput").parentElement.style.display =
                "none";
        })
        .catch(() => {
            // File not found, user must upload
        });
}

/**
 * Handle file upload from user
 */
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            allBills = JSON.parse(event.target.result);
            filteredBills = [...allBills];
            updateStats();
            renderBills();
            document.getElementById("fileInput").style.display = "none";
        } catch (error) {
            alert("Error loading JSON file: " + error.message);
        }
    };
    reader.readAsText(file);
}

// ============================================================================
// Filtering & Sorting
// ============================================================================

/**
 * Filter bills based on search term, type, issue, and sort order
 */
function filterBills() {
    const searchTerm = document
        .getElementById("searchInput")
        .value.toLowerCase();
    const typeFilter = document.getElementById("typeFilter").value;
    const selectedIssues = Array.from(
        document.querySelectorAll(".issue-checkbox:checked")
    ).map((checkbox) => checkbox.value);
    const sortBy = document.getElementById("sortBy").value;

    // Apply search, type, and issue filters
    filteredBills = allBills.filter((bill) => {
        const matchesSearch =
            !searchTerm ||
            bill.doc_number.toLowerCase().includes(searchTerm) ||
            bill.caption.toLowerCase().includes(searchTerm) ||
            bill.sponsors.toLowerCase().includes(searchTerm) ||
            bill.committees.toLowerCase().includes(searchTerm) ||
            (bill.first_reader_summary &&
                bill.first_reader_summary.toLowerCase().includes(searchTerm));

        const matchesType =
            !typeFilter ||
            bill.doc_number.startsWith(typeFilter);

        // If no issues selected, match all bills; otherwise match any selected issue
        const matchesIssue =
            selectedIssues.length === 0 ||
            selectedIssues.includes(getBillIssue(bill));

        return matchesSearch && matchesType && matchesIssue;
    });

    // Apply sorting
    sortBills(filteredBills, sortBy);

    updateStats();
    renderBills();
}

/**
 * Sort bills by the specified field
 */
function sortBills(bills, sortBy) {
    bills.sort((a, b) => {
        if (sortBy === "number") {
            return extractNumber(a.doc_number) - extractNumber(b.doc_number);
        } else if (sortBy === "caption") {
            return a.caption.localeCompare(b.caption);
        }
        return 0;
    });
}

/**
 * Extract numeric value from bill document number
 */
function extractNumber(docNumber) {
    const match = docNumber.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

/**
 * Reset all filters to default state
 */
function resetFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("typeFilter").value = "";
    document.querySelectorAll(".issue-checkbox").forEach((checkbox) => {
        checkbox.checked = false;
    });
    document.getElementById("sortBy").value = "number";
    
    // Close the dropdown
    const checkboxGroup = document.getElementById("issueFilter");
    const issueDropdownToggle = document.getElementById(
        "issueDropdownToggle"
    );
    if (checkboxGroup && issueDropdownToggle) {
        checkboxGroup.classList.remove("open");
        issueDropdownToggle.classList.remove("active");
    }
    
    filterBills();
}

// ============================================================================
// Statistics & Rendering
// ============================================================================

/**
 * Update statistics dashboard with bill counts
 */
function updateStats() {
    const statsContainer = document.getElementById("statsContainer");
    const total = allBills.length;
    const filtered = filteredBills.length;
    const hb = allBills.filter((b) => b.doc_number.startsWith("HB")).length;
    const sb = allBills.filter((b) => b.doc_number.startsWith("SB")).length;

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="number">${total}</div>
            <div class="label">Total Bills</div>
        </div>
        <div class="stat-card">
            <div class="number">${filtered}</div>
            <div class="label">Filtered Results</div>
        </div>
        <div class="stat-card">
            <div class="number">${hb}</div>
            <div class="label">House Bills</div>
        </div>
        <div class="stat-card">
            <div class="number">${sb}</div>
            <div class="label">Senate Bills</div>
        </div>
    `;
}

/**
 * Render filtered bills to the page
 */
function renderBills() {
    const container = document.getElementById("billsContainer");

    if (filteredBills.length === 0) {
        container.innerHTML =
            '<div class="no-results">No bills found. Try adjusting your filters.</div>';
        return;
    }

    // Generate HTML for each bill
    container.innerHTML = filteredBills
        .map(
            (bill, index) => `
            <div class="bill-card" data-bill-index="${index}">
                <div class="bill-header">
                    <div class="bill-number">${bill.doc_number}</div>
                    <div class="bill-tags">${generateBillTags(bill)}</div>
                </div>
                <div class="bill-caption">${bill.caption}</div>
                <div class="bill-meta">
                    <div class="meta-item">
                        <span class="meta-label">Sponsors:</span>
                        <span class="meta-value">${truncate(
                            bill.sponsors,
                            50
                        )}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Committees:</span>
                        <span class="meta-value">${truncate(
                            bill.committees,
                            50
                        )}</span>
                    </div>
                </div>
                <div class="bill-actions">
                    <button class="btn-primary btn-small view-details-btn">📖 View Details</button>
                    <button class="btn-secondary btn-small copy-url-btn" data-url="${bill.detail_url}">🔗 Open Link</button>
                </div>
            </div>
        `
        )
        .join("");

    // Attach event listeners to dynamically created elements
    attachBillCardListeners();
}

/**
 * Attach event listeners to bill card buttons
 */
function attachBillCardListeners() {
    // View details button handler
    document.querySelectorAll(".view-details-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const billIndex = btn.closest(".bill-card").dataset.billIndex;
            const bill = filteredBills[billIndex];
            openModal(bill);
        });
    });

    // Copy URL button handler
    document.querySelectorAll(".copy-url-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const url = btn.dataset.url;
            navigator.clipboard.writeText(url).then(() => {
                alert("Link copied to clipboard!");
            });
        });
    });
}

// ============================================================================
// Modal & Details
// ============================================================================

/**
 * Open detail modal for a specific bill
 */
function openModal(bill) {
    populateModalContent(bill);
    document.getElementById("detailModal").classList.add("active");
}

/**
 * Populate modal with bill details
 */
function populateModalContent(bill) {
    // Basic information
    document.getElementById("modalBillNumber").textContent = bill.doc_number;
    document.getElementById("modalCaption").textContent = bill.caption;
    document.getElementById("modalSponsors").textContent =
        bill.sponsors || "Not available";
    document.getElementById("modalCommittees").textContent =
        bill.committees || "Not available";
    document.getElementById("modalSummary").textContent =
        bill.first_reader_summary || "Not available";

    // Status history
    populateStatusHistory(bill.status_history || []);
}

/**
 * Populate the status history section of the modal
 */
function populateStatusHistory(statusHistory) {
    const statusHistoryContainer = document.getElementById("modalStatusHistory");
    const statusSection = document.getElementById("statusSection");

    if (statusHistory.length > 0) {
        statusHistoryContainer.innerHTML = statusHistory
            .map(
                (item) => `
                <div class="status-item">
                    <div class="status-date">${item.date}</div>
                    <div class="status-text">${item.status}</div>
                </div>
            `
            )
            .join("");
        statusSection.style.display = "block";
    } else {
        statusSection.style.display = "none";
    }
}

/**
 * Close the detail modal
 */
function closeModal() {
    document.getElementById("detailModal").classList.remove("active");
    document.getElementById("statusSection").style.display = "block";
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Truncate text to specified length with ellipsis
 */
function truncate(text, length) {
    return text.length > length ? text.substring(0, length) + "..." : text;
}

// ============================================================================
// App Startup
// ============================================================================

// Initialize the app when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
// Export functions for ES Module usage
export {
    initializeApp,
    filterBills,
    resetFilters,
    openModal,
    closeModal,
};