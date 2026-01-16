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

// Favorites management
let favorites = [];
const FAVORITES_KEY = "georgia-bills-favorites";

// Load favorites from localStorage on startup
function loadFavorites() {
    const stored = localStorage.getItem(FAVORITES_KEY);
    favorites = stored ? JSON.parse(stored) : [];
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Add bill to favorites
function addToFavorites(bill) {
    if (!favorites.find(b => b.doc_number === bill.doc_number)) {
        favorites.push({
            doc_number: bill.doc_number,
            caption: bill.caption,
            sponsors: bill.sponsors
        });
        saveFavorites();
    }
}

// Remove bill from favorites
function removeFromFavorites(billNumber) {
    favorites = favorites.filter(b => b.doc_number !== billNumber);
    saveFavorites();
}

// Check if bill is in favorites
function isFavorited(billNumber) {
    return favorites.some(b => b.doc_number === billNumber);
}

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
    const sponsorsStr = Array.isArray(bill.sponsors) ? bill.sponsors.join(" ") : bill.sponsors;
    const committeesStr = Array.isArray(bill.committees) ? bill.committees.join(" ") : bill.committees;
    const text =
        `${bill.caption} ${sponsorsStr} ${committeesStr} ${bill.first_reader_summary || ""}`.toLowerCase();

    for (const [issue, keywords] of Object.entries(issueKeywords)) {
        if (keywords.some((keyword) => text.includes(keyword))) {
            return issue;
        }
    }

    return null;
}

/**
 * Get the latest status from a bill's status history, sorted by date
 */
function getLatestStatus(bill) {
    if (!bill.status_history || bill.status_history.length === 0) {
        return "Unknown";
    }
    
    // Sort by date to ensure we get the actual latest status
    const sortedHistory = [...bill.status_history].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateA - dateB;
    });
    
    // Return the last status after sorting
    return sortedHistory[sortedHistory.length - 1].status;
}

/**
 * Generate HTML tags for a bill based on relevant keywords found in its content
 */
function generateBillTags(bill) {
    const sponsorsStr = Array.isArray(bill.sponsors) ? bill.sponsors.join(" ") : bill.sponsors;
    const committeesStr = Array.isArray(bill.committees) ? bill.committees.join(" ") : bill.committees;
    const text =
        `${bill.caption} ${sponsorsStr} ${committeesStr} ${bill.first_reader_summary || ""}`.toLowerCase();
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
// Dark Mode
// ============================================================================

/**
 * Initialize dark mode from localStorage preference
 */
function initializeDarkMode() {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        updateDarkModeToggle(true);
    }
}

/**
 * Toggle dark mode and save preference
 */
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
    updateDarkModeToggle(isDarkMode);
}

/**
 * Update the dark mode toggle button appearance
 */
function updateDarkModeToggle(isDarkMode) {
    const toggle = document.getElementById("darkModeToggle");
    if (toggle) {
        toggle.textContent = isDarkMode ? "☀️" : "🌙";
    }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the application by setting up event listeners and loading data
 */
function initializeApp() {
    loadFavorites();
    initializeDarkMode();
    setupEventListeners();
    // Note: loadDataFromFile() triggers CORS errors on file:// protocol
    // Use manual file upload via the file input instead
}

/**
 * Set up all event listeners for form controls and interactions
 */
function setupEventListeners() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", toggleDarkMode);
    }

    // File input handler
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.addEventListener("change", function(e) {
            handleFileUpload(e);
        });
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
    const sponsorFilter = document.getElementById("sponsorFilter");
    const statusFilter = document.getElementById("statusFilter");
    const dateFromFilter = document.getElementById("dateFromFilter");
    const dateToFilter = document.getElementById("dateToFilter");
    const summarySearch = document.getElementById("summarySearch");
    const batchExportBtn = document.getElementById("batchExportBtn");
    const favoritesBtn = document.getElementById("favoritesBtn");
    const advancedSearchBtn = document.getElementById("advancedSearchBtn");

    if (searchInput) searchInput.addEventListener("input", filterBills);
    if (typeFilter) typeFilter.addEventListener("change", filterBills);
    if (sponsorFilter) sponsorFilter.addEventListener("input", filterBills);
    if (statusFilter) statusFilter.addEventListener("change", filterBills);
    if (dateFromFilter) dateFromFilter.addEventListener("change", filterBills);
    if (dateToFilter) dateToFilter.addEventListener("change", filterBills);
    if (summarySearch) summarySearch.addEventListener("input", filterBills);
    
    // Add change listeners to issue checkboxes
    issueCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            updateIssueFilterDisplay();
            filterBills();
        });
    });
    
    if (sortBy) sortBy.addEventListener("change", filterBills);
    if (resetBtn) resetBtn.addEventListener("click", resetFilters);
    if (batchExportBtn) batchExportBtn.addEventListener("click", exportFilteredResults);
    if (favoritesBtn) favoritesBtn.addEventListener("click", openFavorites);
    if (advancedSearchBtn) advancedSearchBtn.addEventListener("click", openAdvancedSearch);

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
            
            if (Array.isArray(data) && data.length > 0) {
                // Deduplicate by doc_number when loading data
                const seenDocNumbers = new Set();
                allBills = data.filter((bill) => {
                    if (seenDocNumbers.has(bill.doc_number)) {
                        return false;
                    }
                    seenDocNumbers.add(bill.doc_number);
                    return true;
                });
                filteredBills = [...allBills];
                currentPage = 1; // Reset pagination
                
                // Use filterBills to ensure all display updates happen
                filterBills();
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
    const sponsorFilter = document.getElementById("sponsorFilter").value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;
    const dateFromFilter = document.getElementById("dateFromFilter").value;
    const dateToFilter = document.getElementById("dateToFilter").value;
    const summarySearch = document.getElementById("summarySearch").value.toLowerCase();

    // Apply all filters
    filteredBills = allBills.filter((bill) => {
        const matchesSearch =
            !searchTerm ||
            bill.doc_number.toLowerCase().includes(searchTerm) ||
            bill.caption.toLowerCase().includes(searchTerm) ||
            (Array.isArray(bill.sponsors) ? bill.sponsors.join(" ").toLowerCase().includes(searchTerm) : bill.sponsors.toLowerCase().includes(searchTerm)) ||
            (Array.isArray(bill.committees) ? bill.committees.join(" ").toLowerCase().includes(searchTerm) : bill.committees.toLowerCase().includes(searchTerm)) ||
            bill.first_reader_summary?.toLowerCase().includes(searchTerm);

        const matchesType = !typeFilter || bill.doc_number.startsWith(typeFilter);

        const matchesIssue =
            selectedIssues.length === 0 || selectedIssues.includes(getBillIssue(bill));

        const matchesSponsor = 
            !sponsorFilter || (Array.isArray(bill.sponsors) ? bill.sponsors.join(" ").toLowerCase().includes(sponsorFilter) : bill.sponsors.toLowerCase().includes(sponsorFilter));

        const matchesStatus =
            !statusFilter || (bill.status_history && 
            bill.status_history.some(status => status.status.includes(statusFilter)));

        const matchesSummary =
            !summarySearch || 
            (bill.first_reader_summary && bill.first_reader_summary.toLowerCase().includes(summarySearch));

        // Date filtering
        const billDate = bill.introduced_date || bill.status_history?.[0]?.date;
        const matchesDateRange = !dateFromFilter && !dateToFilter ||
            ((!dateFromFilter || billDate >= dateFromFilter) &&
             (!dateToFilter || billDate <= dateToFilter));

        return matchesSearch && matchesType && matchesIssue && matchesSponsor && 
               matchesStatus && matchesSummary && matchesDateRange;
    });

    // Deduplicate by doc_number to ensure no duplicates
    const seenDocNumbers = new Set();
    filteredBills = filteredBills.filter((bill) => {
        if (seenDocNumbers.has(bill.doc_number)) {
            return false;
        }
        seenDocNumbers.add(bill.doc_number);
        return true;
    });

    // Apply sorting
    sortBills(filteredBills, sortBy);

    updateStats();
    updateSelectedFiltersDisplay();
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
        if (sortBy === "date-newest") {
            const dateA = a.introduced_date || a.status_history?.[0]?.date || "";
            const dateB = b.introduced_date || b.status_history?.[0]?.date || "";
            return dateB.localeCompare(dateA);
        }
        if (sortBy === "date-oldest") {
            const dateA = a.introduced_date || a.status_history?.[0]?.date || "";
            const dateB = b.introduced_date || b.status_history?.[0]?.date || "";
            return dateA.localeCompare(dateB);
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
 * Update the issue filter dropdown button to show selected filters
 */
function updateIssueFilterDisplay() {
    const issueDropdownToggle = document.getElementById("issueDropdownToggle");
    const selectedCheckboxes = document.querySelectorAll(".issue-checkbox:checked");
    
    if (selectedCheckboxes.length === 0) {
        issueDropdownToggle.textContent = "Select Issues ▼";
    } else if (selectedCheckboxes.length === 1) {
        const label = selectedCheckboxes[0].nextElementSibling.textContent;
        issueDropdownToggle.textContent = label + " ▼";
    } else {
        issueDropdownToggle.textContent = `${selectedCheckboxes.length} Issues Selected ▼`;
    }
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
        updateIssueFilterDisplay();
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

    if (!container) {
        return;
    }

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
    const billsHTML = billsToDisplay
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
                    <button class="favorite-btn ${isFavorited(bill.doc_number) ? 'favorited' : ''}" data-bill-number="${bill.doc_number}" title="Add to favorites">⭐</button>
                </div>
            </div>
        `;
            }
        )
        .join("");
    
    container.innerHTML = billsHTML;

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
    const viewDetailsBtns = document.querySelectorAll(".view-details-btn");
    const copyUrlBtns = document.querySelectorAll(".copy-url-btn");
    const favoriteBtns = document.querySelectorAll(".favorite-btn");
    
    // View details button handler
    viewDetailsBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const billIndex = btn.closest(".bill-card").dataset.billIndex;
            openModal(filteredBills[billIndex]);
        });
    });

    // Open Link button handler
    copyUrlBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const url = btn.dataset.url;
            window.open(url, "_blank");
        });
    });

    // Favorite button handler
    favoriteBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const billNumber = btn.dataset.billNumber;
            const bill = filteredBills.find(b => b.doc_number === billNumber);
            
            if (isFavorited(billNumber)) {
                removeFromFavorites(billNumber);
                btn.classList.remove("favorited");
            } else {
                addToFavorites(bill);
                btn.classList.add("favorited");
            }
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
    const sponsorsText = Array.isArray(bill.sponsors) ? bill.sponsors.join(", ") : (bill.sponsors || "Not available");
    const committeesText = Array.isArray(bill.committees) ? bill.committees.join(", ") : (bill.committees || "Not available");
    document.getElementById("modalSponsors").textContent = sponsorsText;
    document.getElementById("modalCommittees").textContent = committeesText;
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
    // Handle arrays by joining them with commas
    const str = Array.isArray(text) ? text.join(", ") : text;
    return str.length > length ? `${str.substring(0, length)}...` : str;
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
// Advanced Filters & Features
// ============================================================================

/**
 * Display selected filters as badges
 */
function updateSelectedFiltersDisplay() {
    const filtersContainer = document.getElementById("selectedFiltersDisplay");
    if (!filtersContainer) return;

    const activeFilters = [];
    
    const searchInput = document.getElementById("searchInput");
    if (searchInput && searchInput.value) {
        activeFilters.push({ type: "search", value: searchInput.value });
    }

    const typeFilter = document.getElementById("typeFilter");
    if (typeFilter && typeFilter.value) {
        const typeLabel = typeFilter.value === "HB" ? "House Bill" : "Senate Bill";
        activeFilters.push({ type: "type", value: typeLabel });
    }

    const sponsorFilter = document.getElementById("sponsorFilter");
    if (sponsorFilter && sponsorFilter.value) {
        activeFilters.push({ type: "sponsor", value: sponsorFilter.value });
    }

    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter && statusFilter.value) {
        activeFilters.push({ type: "status", value: statusFilter.value });
    }

    const dateFromFilter = document.getElementById("dateFromFilter");
    const dateToFilter = document.getElementById("dateToFilter");
    if (dateFromFilter && dateFromFilter.value) {
        activeFilters.push({ type: "dateFrom", value: dateFromFilter.value });
    }
    if (dateToFilter && dateToFilter.value) {
        activeFilters.push({ type: "dateTo", value: dateToFilter.value });
    }

    const summarySearch = document.getElementById("summarySearch");
    if (summarySearch && summarySearch.value) {
        activeFilters.push({ type: "summary", value: summarySearch.value });
    }

    const selectedIssues = Array.from(document.querySelectorAll(".issue-checkbox:checked"));
    selectedIssues.forEach((checkbox) => {
        const label = checkbox.nextElementSibling?.textContent || checkbox.value;
        activeFilters.push({ type: "issue", value: label });
    });

    // Render filter badges
    filtersContainer.innerHTML = activeFilters
        .map(
            (filter) =>
                `<span class="filter-badge">
                    ${filter.value}
                    <button onclick="removeFilter('${filter.type}', '${filter.value.replace(/'/g, "\\'")}')">×</button>
                </span>`
        )
        .join("");

    // Show batch export button if there are results
    const batchExportBtn = document.getElementById("batchExportBtn");
    if (batchExportBtn) {
        batchExportBtn.style.display = filteredBills.length > 0 ? "block" : "none";
    }
}

/**
 * Remove a specific filter and reapply filtering
 */
function removeFilter(filterType, filterValue) {
    const typeFilter = document.getElementById("typeFilter");
    const sponsorFilter = document.getElementById("sponsorFilter");
    const statusFilter = document.getElementById("statusFilter");
    const dateFromFilter = document.getElementById("dateFromFilter");
    const dateToFilter = document.getElementById("dateToFilter");
    const summarySearch = document.getElementById("summarySearch");
    const searchInput = document.getElementById("searchInput");

    if (filterType === "type" && typeFilter) typeFilter.value = "";
    if (filterType === "sponsor" && sponsorFilter) sponsorFilter.value = "";
    if (filterType === "status" && statusFilter) statusFilter.value = "";
    if (filterType === "dateFrom" && dateFromFilter) dateFromFilter.value = "";
    if (filterType === "dateTo" && dateToFilter) dateToFilter.value = "";
    if (filterType === "summary" && summarySearch) summarySearch.value = "";
    if (filterType === "search" && searchInput) searchInput.value = "";

    if (filterType === "issue") {
        const checkboxes = document.querySelectorAll(".issue-checkbox");
        checkboxes.forEach((cb) => {
            const label = cb.nextElementSibling?.textContent || "";
            if (label === filterValue) {
                cb.checked = false;
            }
        });
    }

    filterBills();
}

/**
 * Export filtered results as CSV
 */
function exportFilteredResults() {
    if (filteredBills.length === 0) {
        alert("No bills to export. Please adjust your filters.");
        return;
    }

    const headers = ["Bill Number", "Caption", "Sponsors", "Committees", "Status", "Summary"];
    const rows = filteredBills.map((bill) => {
        const sponsorsStr = Array.isArray(bill.sponsors) ? bill.sponsors.join("; ") : bill.sponsors;
        const committeesStr = Array.isArray(bill.committees) ? bill.committees.join("; ") : bill.committees;
        return [
            bill.doc_number,
            `"${bill.caption.replace(/"/g, '""')}"`,
            `"${sponsorsStr.replace(/"/g, '""')}"`,
            `"${committeesStr.replace(/"/g, '""')}"`,
            bill.status_history?.[bill.status_history.length - 1]?.status || "Unknown",
            `"${(bill.first_reader_summary || "").slice(0, 100).replace(/"/g, '""')}"`,
        ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const filename = `georgia-legislation-${new Date().toISOString().split("T")[0]}.csv`;
    downloadFile(csv, filename, "text/csv");
}

/**
 * Open the favorites modal
 */
function openFavorites() {
    const modal = document.getElementById("favoritesModal");
    const favoritesList = document.getElementById("favoritesList");

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="favorites-empty">No favorites yet. Click the ⭐ icon on bills to add them!</div>';
    } else {
        favoritesList.innerHTML = favorites
            .map(
                (bill) =>
                    `<div class="favorites-item">
                        <div class="favorites-item-info">
                            <div class="favorites-item-number">${bill.doc_number}</div>
                            <div class="favorites-item-caption">${bill.caption}</div>
                        </div>
                        <button class="favorites-remove-btn" onclick="removeFromFavoritesUI('${bill.doc_number}')">Remove</button>
                    </div>`
            )
            .join("");
    }

    if (modal) {
        modal.classList.add("active");
    }
}

/**
 * Close the favorites modal
 */
function closeFavorites() {
    const modal = document.getElementById("favoritesModal");
    if (modal) {
        modal.classList.remove("active");
    }
}

/**
 * Remove from favorites UI and data
 */
function removeFromFavoritesUI(billNumber) {
    removeFromFavorites(billNumber);
    openFavorites(); // Refresh the modal
}

/**
 * Open the advanced search modal
 */
function openAdvancedSearch() {
    const modal = document.getElementById("advancedSearchModal");
    if (modal) {
        modal.classList.add("active");
        document.getElementById("advancedSearchInput").focus();
    }
}

/**
 * Close the advanced search modal
 */
function closeAdvancedSearch() {
    const modal = document.getElementById("advancedSearchModal");
    if (modal) {
        modal.classList.remove("active");
    }
}

/**
 * Execute advanced search with boolean operators
 */
function executeAdvancedSearch() {
    const input = document.getElementById("advancedSearchInput").value.toLowerCase();
    if (!input) {
        alert("Please enter a search query");
        return;
    }

    const terms = parseAdvancedQuery(input);
    
    filteredBills = allBills.filter((bill) => {
        const billText = `${bill.doc_number} ${bill.caption} ${bill.sponsors} ${bill.committees} ${bill.first_reader_summary || ""}`.toLowerCase();
        return matchesAdvancedQuery(billText, terms);
    });

    closeAdvancedSearch();
    updateStats();
    updateSelectedFiltersDisplay();
    renderBills();
}

/**
 * Parse advanced search query with AND, OR, NOT operators
 */
function parseAdvancedQuery(query) {
    // Simple parser for AND, OR, NOT operators
    const terms = {
        must: [],
        should: [],
        mustNot: [],
    };

    // Split by AND/OR/NOT while preserving them
    const parts = query.split(/\s+(AND|OR|NOT)\s+/i);
    
    let currentOp = "AND";
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (part.toUpperCase() === "AND") {
            currentOp = "AND";
        } else if (part.toUpperCase() === "OR") {
            currentOp = "OR";
        } else if (part.toUpperCase() === "NOT") {
            currentOp = "NOT";
        } else if (part) {
            if (currentOp === "NOT") {
                terms.mustNot.push(part);
                currentOp = "AND";
            } else if (currentOp === "OR") {
                terms.should.push(part);
                currentOp = "AND";
            } else {
                terms.must.push(part);
            }
        }
    }

    return terms;
}

/**
 * Check if text matches advanced query
 */
function matchesAdvancedQuery(text, terms) {
    // Must have all required terms
    const hasMust = terms.must.length === 0 || terms.must.every((term) => text.includes(term));

    // Must not have any excluded terms
    const noMustNot = terms.mustNot.every((term) => !text.includes(term));

    // Should have at least one optional term (if any exist)
    const hasShould = terms.should.length === 0 || terms.should.some((term) => text.includes(term));

    return hasMust && noMustNot && hasShould;
}

// ============================================================================
// App Startup
// ============================================================================

document.addEventListener("DOMContentLoaded", function() {
    initializeApp();
});
