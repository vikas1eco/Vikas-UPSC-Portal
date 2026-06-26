document.addEventListener("DOMContentLoaded", () => {
    let questions = [];
    let currentIndex = 0;
    let userAnswers = {}; // Stores selection index per question index: {0: 1, 1: 0}
    let submittedQuestions = {}; // Track submission per question index: {0: true}
    let score = 0;

    const questionEl = document.getElementById("question");
    const optionsEl = document.getElementById("options");
    const currentEl = document.getElementById("current");
    const totalEl = document.getElementById("total");
    const progressBar = document.getElementById("progress-bar");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const resultEl = document.getElementById("result");
    const quizBox = document.getElementById("quiz-box");
    const buttonsContainer = document.querySelector(".buttons");
    const counterContainer = document.querySelector(".counter");

    async function loadQuiz() {
        try {
            const response = await fetch("questions.json");
            questions = await response.json();
            if (questions.length > 0) {
                initQuiz();
            } else {
                questionEl.textContent = "No questions found in questions.json.";
            }
        } catch (error) {
            console.error("Error loading questions.json:", error);
            questionEl.textContent = "Failed to load quiz data.";
        }
    }

    function initQuiz() {
        currentIndex = 0;
        userAnswers = {};
        submittedQuestions = {};
        score = 0;
        quizBox.style.display = "block";
        buttonsContainer.style.display = "flex";
        counterContainer.style.display = "block";
        totalEl.textContent = questions.length;
        displayQuestion();
    }

    function displayQuestion() {
        resultEl.innerHTML = "";
        const q = questions[currentIndex];
        
        currentEl.textContent = currentIndex + 1;
        updateProgressBar();

        questionEl.textContent = q.question;
        optionsEl.innerHTML = "";

        const isSubmitted = submittedQuestions[currentIndex];

        q.options.forEach((optionText, index) => {
            const label = document.createElement("label");
            label.className = "option";
            
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "quiz-option";
            input.value = index;
            
            if (userAnswers[currentIndex] === index) {
                input.checked = true;
                label.classList.add("selected-opt");
            }

            if (isSubmitted) {
                input.disabled = true;
                label.style.cursor = "default";
            } else {
                input.addEventListener("change", () => {
                    document.querySelectorAll(".option").forEach(el => el.classList.remove("selected-opt"));
                    label.classList.add("selected-opt");
                    userAnswers[currentIndex] = index;
                    submitBtn.disabled = false;
                });
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(optionText));
            optionsEl.appendChild(label);
        });

        prevBtn.disabled = currentIndex === 0;
        
        if (currentIndex === questions.length - 1 && isSubmitted) {
            nextBtn.textContent = "Finish Test ➜";
        } else {
            nextBtn.textContent = "Next ➜";
        }

        if (isSubmitted) {
            submitBtn.disabled = true;
            displayExplanation();
        } else {
            submitBtn.disabled = userAnswers[currentIndex] === undefined;
        }
    }

    function updateProgressBar() {
        const progress = ((currentIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function displayExplanation() {
        const q = questions[currentIndex];
        const selectedIndex = userAnswers[currentIndex];
        const optionMapping = ["A", "B", "C", "D"];
        const selectedLetter = optionMapping[selectedIndex];
        const isCorrect = selectedLetter === q.answer;

        const expBox = document.createElement("div");
        expBox.className = `explanation-box ${isCorrect ? "correct-style" : "incorrect-style"}`;
        
        const title = document.createElement("h3");
        title.textContent = isCorrect ? "✅ Correct Answer" : "❌ Incorrect Answer";
        expBox.appendChild(title);

        const summary = document.createElement("p");
        summary.innerHTML = `Your Answer: <strong>${selectedLetter}</strong> | Correct Answer: <strong>${q.answer}</strong>`;
        expBox.appendChild(summary);

        const text = document.createElement("p");
        text.style.marginTop = "10px";
        text.textContent = q.explanation;
        expBox.appendChild(text);

        resultEl.appendChild(expBox);

        if (q.memory && q.memory.length > 0) {
            const memoryBox = document.createElement("div");
            memoryBox.className = "memory-box";
            
            const memTitle = document.createElement("h4");
            memTitle.textContent = "💡 Memory Points";
            memoryBox.appendChild(memTitle);

            const ul = document.createElement("ul");
            q.memory.forEach(point => {
                const li = document.createElement("li");
                li.textContent = point;
                ul.appendChild(li);
            });
            memoryBox.appendChild(ul);
            resultEl.appendChild(memoryBox);
        }
    }

    submitBtn.addEventListener("click", () => {
        if (submittedQuestions[currentIndex]) return;

        const q = questions[currentIndex];
        const selectedIndex = userAnswers[currentIndex];
        const optionMapping = ["A", "B", "C", "D"];
        const selectedLetter = optionMapping[selectedIndex];

        if (selectedLetter === q.answer) {
            score++;
        }

        submittedQuestions[currentIndex] = true;
        submitBtn.disabled = true;
        
        document.querySelectorAll(".option input").forEach(input => input.disabled = true);
        document.querySelectorAll(".option").forEach(label => label.style.cursor = "default");
        
        displayExplanation();

        if (currentIndex === questions.length - 1) {
            nextBtn.textContent = "Finish Test ➜";
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            displayQuestion();
        } else {
            showFinalResults();
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            displayQuestion();
        }
    });

    function showFinalResults() {
        quizBox.style.display = "none";
        buttonsContainer.style.display = "none";
        counterContainer.style.display = "none";
        progressBar.style.width = "100%";

        const percentage = ((score / questions.length) * 100).toFixed(1);

        resultEl.innerHTML = `
            <div class="score-box">
                <h2>Test Completed!</h2>
                <p>Your Final Score: <strong>${score}</strong> out of <strong>${questions.length}</strong></p>
                <p>Accuracy: <strong>${percentage}%</strong></p>
                <button id="restartBtn">🔄 Restart Test</button>
            </div>
        `;

        document.getElementById("restartBtn").addEventListener("click", () => {
            initQuiz();
        });
    }

    loadQuiz();
});
