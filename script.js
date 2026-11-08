
// SUPABASE CONNECTION
const SUPABASE_URL = "https://qedbnllkbwzyobfwxyzr.supabase.co";

const SUPABASE_KEY = "sb_publishable_dchfs9-THQJ29Wb_CQ3SRw_-PF7lEVB";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// DEFAULT SYMBOLS
let symbols = JSON.parse(localStorage.getItem("symbols")) || [
    { symbol: "♡", keywords: "heart love cute" },
    { symbol: "★", keywords: "star stars" },
    { symbol: "☾", keywords: "moon night" },
    { symbol: "୨୧", keywords: "bow bows ribbon" }
];

// MESSAGES
function showMessage(text) {
    document.getElementById("message").textContent = text;

    setTimeout(function () {
        document.getElementById("message").textContent = "";
    }, 5000);
}

// DISPLAY SYMBOLS
function renderSymbols() {
    let container = document.getElementById("symbols");
    container.innerHTML = "";

    symbols.forEach(function(item) {
        let box = document.createElement("div");
        box.className = "symbol";
        box.textContent = item.symbol;

        box.onclick = function() {
            navigator.clipboard.writeText(item.symbol)
                .then(function() {
                    showMessage("Copied: " + item.symbol);
                })
                .catch(function() {
                    showMessage("Could not copy symbol.");
                });
        };

        container.appendChild(box);
    });
}

// LOAD SYMBOLS FROM SUPABASE
async function loadSymbols() {
    const { data, error } = await supabaseClient
        .from("symbols")
        .select("symbol, keywords")
        .order("created_at", { ascending: true });

    if (error) {
        console.error(error);
        showMessage("Could not load symbols from database.");
        return;
    }

    // If the database is empty, upload the existing symbols once
    if (data.length === 0 && symbols.length > 0) {
        const { error: insertError } = await supabaseClient
            .from("symbols")
            .insert(symbols);

        if (insertError) {
            console.error(insertError);
            showMessage("Could not upload default symbols.");
            return;
        }

        return loadSymbols();
    }

    symbols = data;
    renderSymbols();

    localStorage.setItem("symbols", JSON.stringify(symbols));
}

// ADD SYMBOL TO SUPABASE
async function addSymbol() {
    let symbol = document.getElementById("newSymbol").value.trim();
    let keywords = document.getElementById("keywords").value.trim();

    if (symbol === "" || keywords === "") {
        showMessage("You must add a symbol AND keywords!");
        return;
    }

    if (symbol.length > 20) {
        showMessage("Symbols can only be 20 characters long!");
        return;
    }

    if (keywords.length > 30) {
        showMessage("Keywords can only be 30 characters long!");
        return;
    }

    const { error } = await supabaseClient
        .from("symbols")
        .insert([
            {
                symbol: symbol,
                keywords: keywords
            }
        ]);

    if (error) {
        console.error(error);
        showMessage("Could not add symbol. Try again!");
        return;
    }

    document.getElementById("newSymbol").value = "";
    document.getElementById("keywords").value = "";

    await loadSymbols();

    showMessage("Symbol added successfully!");
}

// SEARCH SYMBOLS
function searchSymbols() {
    let search = document.getElementById("search").value.toLowerCase();

    let container = document.getElementById("symbols");
    container.innerHTML = "";

    symbols.forEach(function(item) {
        if (
            item.symbol.toLowerCase().includes(search) ||
            item.keywords.toLowerCase().includes(search)
        ) {
            let box = document.createElement("div");
            box.className = "symbol";
            box.textContent = item.symbol;

            box.onclick = function() {
                navigator.clipboard.writeText(item.symbol);
                showMessage("Copied: " + item.symbol);
            };

            container.appendChild(box);
        }
    });
}

// DARK MODE
function toggleDarkMode() {
    document.body.classList.toggle("dark");

    let button = document.getElementById("darkModeButton");

    if (document.body.classList.contains("dark")) {
        button.textContent = "Activate white mode";
    } else {
        button.textContent = "Activate dark mode";
    }
}

// MAKE FUNCTIONS ACCESSIBLE TO HTML
window.showMessage = showMessage;
window.addSymbol = addSymbol;
window.searchSymbols = searchSymbols;
window.toggleDarkMode = toggleDarkMode;

// START WEBSITE
loadSymbols();