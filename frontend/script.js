// ============================================================================
// Data Management
// ============================================================================
// This file uses ES Modules (ECMAScript standard) - not CommonJS
// Loaded as: <script type="module" src="script.js"></script>

let allBills = [];
let filteredBills = [];
let currentModalBillIndex = -1;
let currentPage = 1;
const ITEMS_PER_PAGE = 20;

// Keep track of which bills are being displayed for modal indexing across pages
let displayedBillsForModal = [];

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
    education: ["school", "education", "university", "college", "student", "teacher", "curriculum"],
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
    immigration: ["immigration", "immigrant", "border", "visa", "citizenship", "alien"],
    "voting-rights": ["vote", "voting", "election", "registration", "franchise", "ballot"],
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
 * Get the latest status from a bill's status history
 */
function getLatestStatus(bill) {
    if (!bill.status_history || bill.status_history.length === 0) {
        return "Unknown";
    }
    // Return the last status in the array
    return bill.status_history[bill.status_history.length - 1].status;
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
        .map((tag) => `<span class="bill-tag">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`)
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
    } else {
        console.error("File input element not found!");
    }

    // Dropdown toggle handler
    const issueDropdownToggle = document.getElementById("issueDropdownToggle");
    const checkboxGroup = document.getElementById("issueFilter");
    
    if (issueDropdownToggle && checkboxGroup) {
        // Toggle dropdown on button click
        issueDropdownToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = checkboxGroup.classList.toggle("open");
            issueDropdownToggle.classList.toggle("active");
            issueDropdownToggle.setAttribute("aria-expanded", isOpen);
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            const isClickInside = issueDropdownToggle.contains(e.target) || checkboxGroup.contains(e.target);
            if (!isClickInside) {
                checkboxGroup.classList.remove("open");
                issueDropdownToggle.classList.remove("active");
                issueDropdownToggle.setAttribute("aria-expanded", "false");
            }
        });
        
        // Allow clicking checkboxes without closing dropdown
        checkboxGroup.addEventListener("click", (e) => {
            e.stopPropagation();
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
    
    // Add change listeners to issue checkboxes
    issueCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", filterBills);
    });
    
    if (sortBy) sortBy.addEventListener("change", filterBills);
    if (resetBtn) resetBtn.addEventListener("click", resetFilters);

    // Modal navigation and export handlers
    const prevBillBtn = document.getElementById("prevBillBtn");
    const nextBillBtn = document.getElementById("nextBillBtn");
    const exportCSVBtn = document.getElementById("exportCSVBtn");
    const exportJSONBtn = document.getElementById("exportJSONBtn");
    
    if (prevBillBtn) prevBillBtn.addEventListener("click", goToPreviousBill);
    if (nextBillBtn) nextBillBtn.addEventListener("click", goToNextBill);
    if (exportCSVBtn) exportCSVBtn.addEventListener("click", () => {
        if (currentModalBillIndex !== -1) {
            exportToCSV(filteredBills[currentModalBillIndex]);
        }
    });
    if (exportJSONBtn) exportJSONBtn.addEventListener("click", () => {
        if (currentModalBillIndex !== -1) {
            exportToJSON(filteredBills[currentModalBillIndex]);
        }
    });

    // Pagination handlers
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");
    
    if (prevPageBtn) prevPageBtn.addEventListener("click", goToPreviousPage);
    if (nextPageBtn) nextPageBtn.addEventListener("click", goToNextPage);

    // Modal backdrop click handler
    const modal = document.getElementById("detailModal");
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target.id === "detailModal") {
                closeModal();
            }
        });
    }

    // Keyboard navigation: ESC to close modal
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    });
}

/**
 * Attempt to load ga_legislation.json on page load
 */
function loadDataFromFile() {
    fetch("ga_legislation.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("File not found");
            }
            return response.json();
        })
        .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
                showLoadingSpinner(true);
                // Simulate brief parsing time for UX feedback
                setTimeout(() => {
                    allBills = data;
                    filteredBills = [...allBills];
                    updateStats();
                    renderBills();
                    showLoadingSpinner(false);
                    // Hide file input if data loaded successfully
                    const fileInputWrapper = document.querySelector(".file-input-wrapper");
                    if (fileInputWrapper) {
                        fileInputWrapper.style.display = "none";
                    }
                }, 500);
            }
        })
        .catch((error) => {
            // File not found or invalid - user must upload
            showLoadingSpinner(false);
        });
}
/**
 * Handle file upload from user
 */
function handleFileUpload(e) {
    const file = e.target.files[0];
    
    if (!file) {
        return;
    }

    showLoadingSpinner(true);
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (Array.isArray(data)) {
                allBills = data;
                filteredBills = [...allBills];
                updateStats();
                renderBills();
                showLoadingSpinner(false);
                
                // Hide file input wrapper after successful load
                const fileInputWrapper = document.querySelector(".file-input-wrapper");
                if (fileInputWrapper) {
                    fileInputWrapper.style.display = "none";
                }
            } else {
                showLoadingSpinner(false);
                alert("Invalid JSON format. Expected an array of bills.");
            }
        } catch (error) {
            showLoadingSpinner(false);
            alert(`Error loading JSON file: ${error.message}`);
        }
    };
    
    reader.onerror = () => {
        showLoadingSpinner(false);
        alert("Error reading file. Please try again.");
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
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const typeFilter = document.getElementById("typeFilter").value;
    const selectedIssues = Array.from(document.querySelectorAll(".issue-checkbox:checked")).map(
        (checkbox) => checkbox.value
    );
    const sortBy = document.getElementById("sortBy").value;

    // Apply search, type, and issue filters
    filteredBills = allBills.filter((bill) => {
        const matchesSearch =
            !searchTerm ||
            bill.doc_number.toLowerCase().includes(searchTerm) ||
            bill.caption.toLowerCase().includes(searchTerm) ||
            bill.sponsors.toLowerCase().includes(searchTerm) ||
            bill.committees.toLowerCase().includes(searchTerm) ||
            bill.first_reader_summary?.toLowerCase().includes(searchTerm);

        const matchesType = !typeFilter || bill.doc_number.startsWith(typeFilter);

        // If no issues selected, match all bills; otherwise match any selected issue
        const matchesIssue =
            selectedIssues.length === 0 || selectedIssues.includes(getBillIssue(bill));

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
        }
        if (sortBy === "caption") {
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
    return match ? Number.parseInt(match[0]) : 0;
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
    const issueDropdownToggle = document.getElementById("issueDropdownToggle");
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
 * Render filtered bills to the page with pagination support
 */
function renderBills() {
    const container = document.getElementById("billsContainer");
    const paginationContainer = document.getElementById("paginationContainer");

    if (allBills.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <strong>📁 No Data Loaded</strong>
                <p>Please upload a JSON file containing Georgia legislation data to get started.</p>
                <div class="suggestions">
                    <strong>How to load data:</strong>
                    <ol>
                        <li>Click "📁 Choose JSON File" above</li>
                        <li>Select a JSON file with bill data</li>
                        <li>The bills will appear here</li>
                    </ol>
                </div>
            </div>
        `;
        paginationContainer.classList.add("hidden");
        return;
    }

    if (filteredBills.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <strong>🔍 No Matching Bills</strong>
                <p>Your search didn't return any results. Try adjusting your filters.</p>
                <div class="suggestions">
                    <strong>Tips to find bills:</strong>
                    <ol>
                        <li>Clear or broaden your search term</li>
                        <li>Remove bill type filter (try all types)</li>
                        <li>Deselect issue filters</li>
                        <li>Check your spelling</li>
                    </ol>
                </div>
            </div>
        `;
        paginationContainer.classList.add("hidden");
        return;
    }

    // Reset to page 1 after filtering
    currentPage = 1;
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const billsToDisplay = filteredBills.slice(startIndex, endIndex);
    
    // Store displayed bills for modal navigation
    displayedBillsForModal = billsToDisplay;

    // Generate HTML for each bill
    container.innerHTML = billsToDisplay
        .map(
            (bill, displayIndex) => {
                // Calculate actual index in filteredBills array
                const actualIndex = startIndex + displayIndex;
                return `
            <div class="bill-card" data-bill-index="${actualIndex}">
                <div class="bill-header">
                    <div class="bill-number">${bill.doc_number}</div>
                    <div class="bill-tags">${generateBillTags(bill)}</div>
                </div>
                <div class="bill-caption">${bill.caption}</div>
                <div class="bill-meta">
                    <div class="meta-item">
                        <span class="meta-label">Status:</span>
                        <span class="meta-value status-badge">${getLatestStatus(bill)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Sponsors:</span>
                        <span class="meta-value">${truncate(bill.sponsors, 50)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Committees:</span>
                        <span class="meta-value">${truncate(bill.committees, 50)}</span>
                    </div>
                </div>
                <div class="bill-actions">
                    <button class="btn-primary btn-small view-details-btn">📖 View Details</button>
                    <button class="btn-secondary btn-small copy-url-btn" data-url="${bill.detail_url}">🔗 Open Link</button>
                </div>
            </div>
        `;
            }
        )
        .join("");

    // Show/hide pagination controls
    if (totalPages > 1) {
        paginationContainer.classList.remove("hidden");
        updatePaginationDisplay(currentPage, totalPages);
        
        // Update button states
        const prevBtn = document.getElementById("prevPageBtn");
        const nextBtn = document.getElementById("nextPageBtn");
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    } else {
        paginationContainer.classList.add("hidden");
    }

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
            openModal(filteredBills[billIndex]);
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
    const billIndex = filteredBills.indexOf(bill);
    if (billIndex !== -1) {
        currentModalBillIndex = billIndex;
    }
    populateModalContent(bill);
    document.getElementById("detailModal").classList.add("active");
    updateBillCounter();
}

/**
 * Populate modal with bill details
 */
function populateModalContent(bill) {
    // Basic information
    document.getElementById("modalBillNumber").textContent = bill.doc_number;
    document.getElementById("modalCaption").textContent = bill.caption;
    document.getElementById("modalSponsors").textContent = bill.sponsors || "Not available";
    document.getElementById("modalCommittees").textContent = bill.committees || "Not available";
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
    return text.length > length ? `${text.substring(0, length)}...` : text;
}

/**
 * Show or hide the loading spinner
 */
function showLoadingSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    if (show) {
        spinner.classList.remove("hidden");
    } else {
        spinner.classList.add("hidden");
    }
}

/**
 * Update the bill counter in the modal header
 */
function updateBillCounter() {
    if (filteredBills.length === 0) {
        document.getElementById("billCounter").textContent = "";
        return;
    }
    const counter = document.getElementById("billCounter");
    counter.textContent = `Bill ${currentModalBillIndex + 1} of ${filteredBills.length}`;
}

/**
 * Navigate to next bill in modal
 */
function goToNextBill() {
    if (currentModalBillIndex < filteredBills.length - 1) {
        currentModalBillIndex++;
        openModal(filteredBills[currentModalBillIndex]);
    }
}

/**
 * Navigate to previous bill in modal
 */
function goToPreviousBill() {
    if (currentModalBillIndex > 0) {
        currentModalBillIndex--;
        openModal(filteredBills[currentModalBillIndex]);
    }
}

/**
 * Export current bill to CSV format
 */
function exportToCSV(bill) {
    const headers = ["Doc Number", "Caption", "Sponsors", "Committees", "Detail URL", "Latest Status", "Summary"];
    const values = [
        bill.doc_number,
        bill.caption,
        bill.sponsors,
        bill.committees || "",
        bill.detail_url,
        getLatestStatus(bill),
        (bill.first_reader_summary || "").replace(/"/g, '""')  // Escape quotes
    ];
    
    // Wrap values in quotes if they contain commas
    const csvRow = values.map(v => {
        const str = String(v);
        return str.includes(",") ? `"${str}"` : str;
    }).join(",");
    
    const csv = `${headers.join(",")}\n${csvRow}`;
    downloadFile(csv, `${bill.doc_number}.csv`, "text/csv");
}

/**
 * Export current bill to JSON format
 */
function exportToJSON(bill) {
    const json = JSON.stringify(bill, null, 2);
    downloadFile(json, `${bill.doc_number}.json`, "application/json");
}

/**
 * Download file helper function
 */
function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

/**
 * Update pagination display with current page information
 */
function updatePaginationDisplay(currentPageNum, totalPages) {
    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPageNum} of ${totalPages}`;
    }
}

/**
 * Navigate to the next page of bills
 */
function goToNextPage() {
    const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderBills();
        scrollToTop();
    }
}

/**
 * Navigate to the previous page of bills
 */
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderBills();
        scrollToTop();
    }
}

/**
 * Scroll to top of bills container for better UX
 */
function scrollToTop() {
    const container = document.getElementById("billsContainer");
    if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// ============================================================================
// App Startup
// ============================================================================

// Initialize the app when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
