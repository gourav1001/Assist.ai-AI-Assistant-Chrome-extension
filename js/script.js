console.log("Assist.ai - AI Assistant loaded!");
// method to make ChatGpt API calls and populate the response back
const askChatGPTAndPopulateResponse = async (node, text) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${apikey}`);

        // set request payload
        const raw = JSON.stringify({
            model: "text-davinci-003",
            prompt: text,
            max_tokens: 50,
            temperature: 0,
            top_p: 1,
            n: 1,
            stream: false,
            logprobs: null,
        });

        // set request options
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        // make the api call
        let response = await fetch("https://api.openai.com/v1/completions", requestOptions);
        response = await response.json();
        const { choices } = response;

        // remove the spaces from the reponse text
        const responseText = choices[0].text.replace(/^\s+|\s+$/g, "");

        console.log(responseText);

        // populate the node with the response
        node.textContent = responseText;
    } catch (e) {
        console.error("API error encountered while calling openai api!", e);
    }
};

// method to debounce method invokation
const debounce = (func, delay) => {
    let inDebounce;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => func.apply(context, args), delay);
    };
}

// method to scrap and parse text
const textScrapperAndParser = () => {
    const node = document.querySelector('[contenteditable="true"]');
    const { textContent } = node;
    let parsedCommand = parseTextAndExtractCommand(textContent);
    return {
        'node': node,
        'command': parsedCommand
    };
}

// method to parse text and extract command
const parseTextAndExtractCommand = (textContent) => {
    const parsedCommand = /assist:(.*?)\;/gi.exec(textContent);
    return parsedCommand ? parsedCommand[1].trim() : "";
}

// method to process user request
const processRequest = () => {
    // scrap and parse textual content
    let { node, command } = textScrapperAndParser();
    console.log(node);
    console.log(command);
    // ask and populate chatGpt response
    // askChatGPTAndPopulateResponse(node, command);
}

// debounced user request processing by 2ms
const debouncedProcessRequest = debounce(processRequest, 2000);

// adding event listener
window.addEventListener('keypress', debouncedProcessRequest);