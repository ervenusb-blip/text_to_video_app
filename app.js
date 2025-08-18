async function generateVideo(useGemini = false) {
    document.getElementById("status").innerText = "⏳ Generating...";

    const res = await fetch("http://localhost:5001/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            useGemini,
            prompt: document.getElementById("prompt").value,
        }),
    });

    const data = await res.json();
    document.getElementById("status").innerText = "✅ Done!";
    document.getElementById("outputImage").src = data.imageUrl;
    document.getElementById("outputVideo").src = data.videoUrl;
}

<
!DOCTYPE html >
    <
    html >
    <
    head >
    <
    title > Text to Video App < /title> <
    link rel = "stylesheet"
href = "style.css" / >
    <
    /head> <
    body >
    <
    h1 > 🎬Text→ Video Generator < /h1>

<
textarea id = "prompt"
placeholder = "Enter your own prompt..." > < /textarea> <
    br / >
    <
    button onclick = "generateVideo(false)" > Use My Prompt < /button> <
    button onclick = "generateVideo(true)" > Ask Gemini < /button>

<
p id = "status" > < /p> <
    img id = "outputImage"
style = "max-width:400px;display:block;" / >
    <
    video id = "outputVideo"
controls style = "max-width:400px;" > < /video>

<
script src = "app.js" > < /script> <
    /body> <
    /html>