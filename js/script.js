console.log("Assist.ai - AI Assistant loaded!");

// method to make ChatGpt API calls and populate the response back
const askChatGPTAndPopulateResponse = async (node, type, request, command) => {
    try {
        //     const myHeaders = new Headers();
        //     myHeaders.append("Content-Type", "application/json");
        //     myHeaders.append("Authorization", `Bearer ${apikey}`);

        //     // set request payload
        //     const raw = JSON.stringify({
        //         model: "text-davinci-003",
        //         prompt: command,
        //         max_tokens: 50,
        //         temperature: 0,
        //         top_p: 1,
        //         n: 1,
        //         stream: false,
        //         logprobs: null,
        //     });

        //     // set request options
        //     const requestOptions = {
        //         method: "POST",
        //         headers: myHeaders,
        //         body: raw,
        //         redirect: "follow",
        //     };

        //     // make the api call
        //     let response = await fetch("https://api.openai.com/v1/completions", requestOptions);
        //     response = await response.json();
        //     const { choices } = response;

        //     // remove the spaces from the reponse text
        //     const responseText = choices[0].text.replace(/^\s+|\s+$/g, "");

        //     console.log(responseText);
        let responseText = "Gpt: " + command;
        // populate the node with the response based on its type
        if (type == "contenteditable") {
            node.textContent = node.textContent.replace(request, responseText);
        } else if (type == "textarea" || type == "input") {
            node.value = node.value.replace(request, responseText);
        }
    } catch (e) {
        console.error("API error encountered while calling openai.ai api!");
        console.log(e);
    }
};

// helper method to debounce method invokation
const debounce = (func, delay) => {
    let inDebounce;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => func.apply(context, args), delay);
    };
};

// method to scrap and parse text
const textScrapperAndParser = () => {
    // getting all html elements having property contenteditable set to true and searching for command 
    let elements = document.querySelectorAll('[contenteditable="true"]');
    if (elements.length) {
        for (ele of elements) {
            let { textContent } = ele;
            let parsedCommand = parseTextAndExtractCommand(textContent);
            if (parsedCommand) {
                return {
                    'node': ele,
                    'type': 'contenteditable',
                    'request': parsedCommand[0],
                    'command': parsedCommand[1].trim(),
                };
            }
        }
    }
    // getting all textarea html elements and searching for command 
    elements = document.querySelectorAll('textarea');
    if (elements.length) {
        for (ele of elements) {
            let { value } = ele;
            let parsedCommand = parseTextAndExtractCommand(value);
            if (parsedCommand) {
                return {
                    'node': ele,
                    'type': 'textarea',
                    'request': parsedCommand[0],
                    'command': parsedCommand[1].trim(),
                };
            }
        }
    }
    // getting all input html elements and searching for command
    elements = document.querySelectorAll('input');
    if (elements.length) {
        for (ele of elements) {
            let { value } = ele;
            let parsedCommand = parseTextAndExtractCommand(value);
            if (parsedCommand) {
                return {
                    'node': ele,
                    'type': 'input',
                    'request': parsedCommand[0],
                    'command': parsedCommand[1].trim(),
                };
            }
        }
    }
    // returning null object for unsuccessful search
    return {
        'node': null,
        'type': null,
        'command': null
    };
};

// method to parse text and extract command
const parseTextAndExtractCommand = (textContent) => {
    const parsedCommand = /assist:(.*?)\;/gi.exec(textContent);
    return parsedCommand;// ? parsedCommand[1].trim() : "";
};

// method to process user request
const processRequest = () => {
    // scrap and parse textual content
    let { node, type, request, command } = textScrapperAndParser();
    console.log(command);
    if (node && type && command) {
        console.log("Asking ChatGpt...");
        // ask and populate chatGpt response
        askChatGPTAndPopulateResponse(node, type, request, command);
    }
};

// debounced user request processing by 3.5ms
const debouncedProcessRequest = debounce(processRequest, 3500);

// adding event listener
window.addEventListener('keypress', debouncedProcessRequest);