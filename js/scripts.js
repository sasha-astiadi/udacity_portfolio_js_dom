/* ==========================================================================
   Personal Portfolio - DOM manipulation & form validation
   ========================================================================== */

// Data source paths (relative to index.html)
const ABOUT_ME_URL = './data/aboutMeData.json';
const PROJECTS_URL = './data/projectsData.json';

// Fallbacks for incomplete data (missing image fields in the API response)
const CARD_PLACEHOLDER = '../images/card_placeholder_bg.webp';
const SPOTLIGHT_PLACEHOLDER = '../images/spotlight_placeholder_bg.webp';
const HEADSHOT_PLACEHOLDER = '../images/headshot.webp';
const DEFAULT_URL = '#';

// Form validation rules
const MESSAGE_MAX_LENGTH = 300;
const ILLEGAL_EMAIL_CHARS = /[^a-zA-Z0-9@._-]/;
// Messages get a friendlier whitelist that still blocks risky characters
// like < > { } $ % ^ & while allowing spaces and normal punctuation.
const ILLEGAL_MESSAGE_CHARS = /[^a-zA-Z0-9\s.,!?'":;()@_-]/;
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fetched data kept globally so any function can reuse it
let aboutMeData = null;
let projectsData = [];

/* --------------------------------------------------------------------------
   Data fetching
   -------------------------------------------------------------------------- */

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/* --------------------------------------------------------------------------
   About Me section
   -------------------------------------------------------------------------- */

function renderAboutMe(data) {
    const aboutMeDiv = document.getElementById('aboutMe');
    if (!aboutMeDiv || !data) return;

    const bio = document.createElement('p');
    bio.textContent = data.aboutMe || 'Welcome to my portfolio!';

    const headshotContainer = document.createElement('div');
    headshotContainer.className = 'headshotContainer';

    const headshot = document.createElement('img');
    headshot.src = data.headshot || HEADSHOT_PLACEHOLDER;
    headshot.alt = 'Headshot photo';

    headshotContainer.appendChild(headshot);
    aboutMeDiv.append(bio, headshotContainer);
}

/* --------------------------------------------------------------------------
   Projects section
   -------------------------------------------------------------------------- */

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'projectCard inactive';
    card.id = project.project_id || '';
    card.style.backgroundImage = `url("${project.card_image || CARD_PLACEHOLDER}")`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';

    const title = document.createElement('h4');
    title.textContent = project.project_name || 'Untitled Project';

    const teaser = document.createElement('p');
    teaser.textContent = project.short_description || 'Click to learn more about this project.';

    card.append(title, teaser);
    card.addEventListener('click', () => selectProject(project));
    return card;
}

function renderProjects(projects) {
    const projectList = document.getElementById('projectList');
    if (!projectList || !Array.isArray(projects) || projects.length === 0) return;

    const fragment = document.createDocumentFragment();
    projects.forEach((project) => fragment.appendChild(createProjectCard(project)));
    projectList.appendChild(fragment);

    // Default spotlight content is the first record in the data set
    selectProject(projects[0]);
}

function selectProject(project) {
    updateSpotlight(project);

    // Visually mark which card is currently featured
    document.querySelectorAll('.projectCard').forEach((card) => {
        card.classList.toggle('active', card.id === project.project_id);
        card.classList.toggle('inactive', card.id !== project.project_id);
    });
}

function updateSpotlight(project) {
    const spotlight = document.getElementById('projectSpotlight');
    const spotlightTitles = document.getElementById('spotlightTitles');
    if (!spotlight || !spotlightTitles) return;

    spotlight.style.backgroundImage = `url("${project.spotlight_image || SPOTLIGHT_PLACEHOLDER}")`;
    spotlight.style.backgroundSize = 'cover';
    spotlight.style.backgroundPosition = 'center';

    const title = document.createElement('h3');
    title.textContent = project.project_name || 'Untitled Project';

    const description = document.createElement('p');
    description.textContent = project.long_description || 'No description available for this project yet.';

    const link = document.createElement('a');
    link.textContent = 'Click here to see more...';
    link.href = project.url || DEFAULT_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    spotlightTitles.replaceChildren(title, description, link);
}

/* --------------------------------------------------------------------------
   Project list navigation arrows
   Scrolls horizontally on mobile, vertically on desktop (>=1024px per CSS)
   -------------------------------------------------------------------------- */

function setupNavArrows() {
    const projectList = document.getElementById('projectList');
    const leftArrow = document.querySelector('.arrow-left');
    const rightArrow = document.querySelector('.arrow-right');
    if (!projectList || !leftArrow || !rightArrow) return;

    const desktopQuery = window.matchMedia('(width >= 1024px)');
    const SCROLL_AMOUNT = 220; // card width (200px) + gap (20px)

    function scroll(direction) {
        const amount = direction * SCROLL_AMOUNT;
        if (desktopQuery.matches) {
            projectList.scrollBy({ top: amount, behavior: 'smooth' });
        } else {
            projectList.scrollBy({ left: amount, behavior: 'smooth' });
        }
    }

    leftArrow.addEventListener('click', () => scroll(-1));
    rightArrow.addEventListener('click', () => scroll(1));
}

/* --------------------------------------------------------------------------
   Contact form validation
   -------------------------------------------------------------------------- */

function setupFormValidation() {
    const form = document.getElementById('formSection');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const charactersLeft = document.getElementById('charactersLeft');
    if (!form || !emailInput || !messageInput) return;

    // Live character count for the textarea
    messageInput.addEventListener('input', () => {
        charactersLeft.textContent = `Characters: ${messageInput.value.length}/${MESSAGE_MAX_LENGTH}`;
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const message = messageInput.value;
        let isValid = true;

        // --- Email checks ---
        if (email === '') {
            emailError.textContent = 'Email address cannot be empty.';
            isValid = false;
        } else if (ILLEGAL_EMAIL_CHARS.test(email)) {
            emailError.textContent = 'Email contains illegal characters. Only letters, numbers, @, ., _ and - are allowed.';
            isValid = false;
        } else if (!VALID_EMAIL.test(email)) {
            emailError.textContent = 'Please enter a valid email address (e.g. name@example.com).';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        // --- Message checks ---
        if (message.trim() === '') {
            messageError.textContent = 'Message cannot be empty.';
            isValid = false;
        } else if (message.length > MESSAGE_MAX_LENGTH) {
            messageError.textContent = `Message is too long. Please keep it under ${MESSAGE_MAX_LENGTH} characters (currently ${message.length}).`;
            isValid = false;
        } else if (ILLEGAL_MESSAGE_CHARS.test(message)) {
            messageError.textContent = 'Message contains illegal characters. Please remove special characters like <, >, {, }, $, %, ^ or &.';
            isValid = false;
        } else {
            messageError.textContent = '';
        }

        if (isValid) {
            alert('Form validation passed! Your message was submitted successfully.');
            form.reset();
            charactersLeft.textContent = `Characters: 0/${MESSAGE_MAX_LENGTH}`;
        }
    });
}

/* --------------------------------------------------------------------------
   Initialization
   -------------------------------------------------------------------------- */

async function init() {
    try {
        const [about, projects] = await Promise.all([
            fetchJSON(ABOUT_ME_URL),
            fetchJSON(PROJECTS_URL),
        ]);
        aboutMeData = about;
        projectsData = projects;

        renderAboutMe(aboutMeData);
        renderProjects(projectsData);
    } catch (error) {
        // Re-throw so the failure is visible during debugging
        console.error('Error loading portfolio data:', error);
    }

    setupNavArrows();
    setupFormValidation();
}

// The script is loaded with `defer`, so the DOM is ready before this runs.
init();
