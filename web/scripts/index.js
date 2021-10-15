function _submit() {
    const redirectUrl = document.getElementById("redirect-url").value
    const title = document.getElementById("title").value
    const description = document.getElementById("description").value 
    let result = document.getElementById("result");

    result.style.display = "unset"
    result.innerHTML = `
    <div class="result-content">
        <span>
            Načítání.....
        </span>
    </div>
    `

    fetch("/api/v1/new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: "redirect",
            redirectUrl,
            title,
            description
        })
    })

    .then(async res => {
        if(res.status === 429) {
            return result.innerHTML = `
            <div class="result-content">
                <span style="color: #f62c3a">Překročil jsi limit! Počkej chvíly a zkus to znova.</span>
            </div>
            `
        }
        let json = await res.json()
        if(res.status === 400) {
            if(json.result.includes("type")) {
                return result.innerHTML = `
                    <div class="result-content">
                        <span style="color: #f62c3a">Nastala chyba při odesílání požadavku... kontaktuj prosím <a href="https://miftik.tk/discord">MiftikaCZ</a>.</span>
                    </div>
                `
            } else if(json.result.includes("redirectUrl")) {
                return result.innerHTML = `
                <div class="result-content">
                <span style="color: #f62c3a">Chybí ti první políčko!.</span>
                </div>
            `
            }

        }
        result.style.display = "unset"
        result.innerHTML = `
        <div class="result-content">
            <span>
                Super, odkaz na tvůj redirect je <span class="odkaz">http://localhost:3000/${json.code}</span>
            </span>
        </div>
        `
        window.onclick = (e) => {
            if (e.target == result) {
                result.style.display = "none";
            }
          } 
    })
}