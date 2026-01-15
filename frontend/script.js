// ============================================================================
// Data Management
// ============================================================================

let allBills = [];
let filteredBills = [];

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

    // Filter and search handlers
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const sortBy = document.getElementById("sortBy");
    const resetBtn = document.getElementById("resetBtn");

    if (searchInput) searchInput.addEventListener("input", filterBills);
    if (typeFilter) typeFilter.addEventListener("change", filterBills);
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
 * Filter bills based on search term, type, and sort order
 */
function filterBills() {
    const searchTerm = document
        .getElementById("searchInput")
        .value.toLowerCase();
    const typeFilter = document.getElementById("typeFilter").value;
    const sortBy = document.getElementById("sortBy").value;

    // Apply search and type filters
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

        return matchesSearch && matchesType;
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
    document.getElementById("sortBy").value = "number";
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
                <div class="bill-number">${bill.doc_number}</div>
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
