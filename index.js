async function getdog() {
    let dog = await fetch("https://dog.ceo/api/breeds/image/random")
    let dogData = await dog.json();

    let dogURL = dogData.message;

    return dogURL;
}

let currentPageData;

window.onload = event => {
    console.log("loaded!");
    const dogsFeed = document.getElementById("dogsFeed");
    let dogNumber = 0;

    let saved = localStorage.getItem("currentdogs");
    if (saved) { currentPageData = JSON.parse(saved); restorePage()}
    else {initializePage()}

    async function makedogImg(dogURL) {
        let dogImg = dogURL || await getdog();
        let newdog = document.createElement("img");
        newdog.setAttribute("class", "dog");
        newdog.setAttribute("src", dogImg);

        return newdog;
    }

    async function adddog(dogURL, upvotes, commentHTML) {
        let dogImg = await makedogImg(dogURL);
        let newdog = document.createElement("div");
        newdog.setAttribute("class", "dogDiv");
        newdog.appendChild(dogImg);

        let dogSrc = getURL(newdog);

        let votes = getVoteContainer(upvotes || getRandomNum());
        newdog.appendChild(votes);

        let comments = getCommentsContainer(commentHTML || " ");
        newdog.appendChild(comments);

        if (extraCount && extraCount % 2 !== 0) {
            comments.classList.add("hide");
            votes.classList.add("hide");
            newdog.classList.add("expand");
        }

        dogsFeed.appendChild(newdog);
        dogNumber++;

        saveCurrentPage();
    }

    function getVoteButtons(votes, num) {
        let container = document.createElement("div");
        container.setAttribute("class", "buttons");

        let upvote = document.createElement("button");
        upvote.setAttribute("class", "upvote");
        upvote.setAttribute("type", "button");
        upvote.innerText = "Upvote";
        container.appendChild(upvote);

        let downvote = document.createElement("button");
        downvote.setAttribute("class", "downvote");
        downvote.setAttribute("type", "button");
        downvote.innerText = "Downvote";
        container.appendChild(downvote);

        addVoteListeners(upvote, downvote, votes, num);

        return container;
    }

    function getVoteContainer(upvotes) {
        let voteContainer = document.createElement("div");
        voteContainer.setAttribute("class", "voteContainer");

        let num = upvotes;

        let votes = document.createElement("p");
        votes.setAttribute("class", "voteCount");
        votes.innerText = `Popularity: ${num}`
        voteContainer.appendChild(votes);

        voteContainer.appendChild(getVoteButtons(votes, num));
        return voteContainer;
    }

    function addVoteListeners(upvote, downvote, votes, num) {
        upvote.addEventListener("click", event => {
            num++;
            votes.innerText = `Popularity: ${num}`;
            saveCurrentPage();
        });

        downvote.addEventListener("click", event => {
            num--;
            votes.innerText = `Popularity: ${num}`;
            saveCurrentPage();
        });
    };

    function getCommentField() {
        let comment = document.createElement("form");
        comment.setAttribute("class", "commentForm");

        let label = document.createElement("label");
        label.setAttribute("for", "comment");
        label.setAttribute("class", "label");
        label.innerText = "Comment:";
        comment.appendChild(label);

        let field = document.createElement("textarea");
        field.setAttribute("class", "commentField");
        comment.appendChild(field);

        let submit = document.createElement("button");
        submit.setAttribute("type", "button");
        submit.setAttribute("class", "submit");
        submit.innerText = "Submit";
        comment.appendChild(submit);

        return [comment, submit, field];
    }

    function getCommentsContainer(commentHTML) {
        let container = document.createElement("div");
        container.setAttribute("class", "commentContainer");

        let [commentField, submit, field] = getCommentField();
        container.appendChild(commentField);

        let posted = document.createElement("ul");
        posted.setAttribute("class", "posted");
        if (commentHTML.length > 1) {
            posted.innerHTML = commentHTML;
        } else {
            let randomNum = Math.floor(Math.random() * 4);
            for (let i = 0; i < randomNum; i++) {
                let comment = getRandomComment();
                posted.insertAdjacentHTML("afterbegin", `<li class="comment">${comment} - <span class="inner">at ${new Date()}</span></li>`);
                }
            }

        container.appendChild(posted);

        submit.addEventListener("click", event => {
            let newComment = field.value;

            if (newComment.length > 0) {
                posted.insertAdjacentHTML("afterbegin", `<li class="comment">${newComment} - <span class="inner">at ${new Date()}</span></li>`);
                saveCurrentPage();
            }
        })

        return container;
    }

    function initializePage() {
        for (let i = 0; i < 10; i++) { adddog() }
    }

    let loadMore = document.getElementById("load");
    loadMore.addEventListener("click", event => {
        for (let i = 0; i < 10; i++) { adddog() }

        setTimeout(unloaddogs, 5000);
    });

    function unloaddogs() {
        if (dogNumber <= 20) {return}

        let dogs = dogsFeed.children;
        let subtract = dogNumber - 20;

        console.log("subtract", subtract);
        console.log("dogNumber", dogNumber)

        try {
            for (let i = 0; i < subtract; i++) { dogs[i].remove(); dogNumber-- }
        } catch {console.log(`unload stopped!`)}

        saveCurrentPage();
    }

    function saveCurrentPage() {
        currentPageData = {};
        let dogs = dogsFeed.children;

        for (let i = 0; i < dogs.length; i++) {
            let dog = dogs[i];

            currentPageData[getURL(dog)] = {
                upvotes: getUpvotes(dog),
                comments: getComments(dog)
            }
        }

        localStorage.setItem("currentdogs", JSON.stringify(currentPageData));
    }

    function restorePage() {
        for (let dogs in currentPageData) {
            let dog = currentPageData[dogs];
            let upvotes = dog.upvotes;
            let comments = dog.comments;

            adddog(dogs, upvotes, comments);
        }
    }

    function finddog(dogURL) {
        let dogs = dogsFeed.children;

        for (let i = 0; i < dogs.length; i++) {
            let url = getURL(dogs[i]);
            if (url === dogURL) { return dogs[i] }
        }
    }

    function getURL(dog) {
        return dog.children[0].src;
    }

    function getUpvotes(dog) {
        return dog.children[1].children[0].innerText.split(": ")[1];
    }

    function getComments(dog) {
        return dog.children[2].children[1].innerHTML;
    }

    let extraCount = 0;
    const extrasButton = document.getElementById("toggle");
    extrasButton.addEventListener("click", event => {
        let comments = document.querySelectorAll(".commentContainer");
        let upvotes = document.querySelectorAll(".voteContainer");
        let dogs = document.querySelectorAll(".dogDiv");

        comments.forEach(comment => {
            comment.classList.toggle("hide");
        });

        upvotes.forEach(vote => {
            vote.classList.toggle("hide");
        });

        dogs.forEach(dog => {
            dog.classList.toggle("expand");
        });

        extraCount++;
        if (extraCount % 2 === 0) { extrasButton.innerText = "Hide Extras" }
        else { extrasButton.innerText = "Show Extras" }
    });

    function getRandomNum() {
        return Math.floor(Math.random() * 500000);
    }

    function getRandomComment() {
        let possibleComments = ["RUFF!", "I'm howling right now lol", "You're my best friend!!!!", "I want to PLAY!", "#mansbestfriend",
                                "I feel like I can smell this image, it's like I'm really there!! :)", "Do you want to go on a play-date?",
                                "YAAS alpha female SLAY!", "FOOD FOOD FOOD FOOOOOOOOOOD!!!!!!!!!!", "How do you guys feel about cats?",
                                "I think the cats are right about JavaScript", "I have so much ENERGY!", "cool", "#fluffy", "bark", "i like your fur",
                                "Do you think the humans suspect anything?", ":)", "U・ᴥ・U", "dog check!!"];

        let randomIdx = Math.floor(Math.random() * possibleComments.length);
        return possibleComments[randomIdx];
    }

}
