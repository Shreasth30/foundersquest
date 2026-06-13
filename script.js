document.addEventListener('DOMContentLoaded', () => {

    /* ===== Navbar Scroll & Hamburger ===== */
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    /* ===== Intersection Observer for Fade-Up ===== */
    const fadeElements = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));

    /* ===== Number Counters ===== */
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                let count = 0;
                const updateCount = () => {
                    const inc = target / 50;
                    if (count < target) {
                        count += inc;
                        entry.target.innerText = Math.ceil(count);
                        setTimeout(updateCount, 30);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                updateCount();
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    /* ===== FAQ Accordion ===== */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    /* ===== Application Wizard & Data Handling ===== */
    const applicationForm = document.getElementById('applicationForm');
    const steps = document.querySelectorAll('.wizard-step');
    const progressBar = document.getElementById('progress-bar');
    let currentStep = 1;
    const totalSteps = steps.length;

    // The single data object as requested
    let applicationData = {};

    // Domain Challenges Dictionary
    const domainChallenges = {
        "Marketing & Branding": "With only ₹1000, how would you get 100 registrations for an event?",
        "Technical Team": "What features would you build for an E-Cell website?",
        "Design & Creative": "Describe a logo concept for E-CELL IGNITE 2026.",
        "Operations & Management": "A speaker cancels one hour before the event. What will you do?",
        "Social Media & Content": "Suggest five content ideas.",
        "Sponsorship & Corporate Relations": "Write a sponsorship pitch.",
        "Startup Outreach": "How would you convince a founder to speak at an event?",
        "Research & Strategy": "What startup trend should students watch in 2026?"
    };

    function updateWizard() {
        steps.forEach(step => step.classList.remove('active'));
        const activeStep = document.querySelector(`.wizard-step[data-step="${currentStep}"]`);
        if (activeStep) activeStep.classList.add('active');

        // Update progress bar
        progressBar.style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
    }

    // Capture input to applicationData dynamically when next is clicked
    function captureDataForCurrentStep() {
        const activeStep = document.querySelector(`.wizard-step[data-step="${currentStep}"]`);
        const inputs = activeStep.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.checked) {
                    if (!applicationData[input.name]) {
                        applicationData[input.name] = [];
                    }
                    if (!applicationData[input.name].includes(input.value)) {
                        applicationData[input.name].push(input.value);
                    }
                } else if (applicationData[input.name]) {
                    // Remove if unchecked
                    const index = applicationData[input.name].indexOf(input.value);
                    if (index > -1) applicationData[input.name].splice(index, 1);
                }
            } else {
                applicationData[input.name] = input.value;
            }
        });
    }

    // Validation
    function validateStep() {
        const activeStep = document.querySelector(`.wizard-step[data-step="${currentStep}"]`);
        const requiredInputs = activeStep.querySelectorAll('[required]');
        for (let input of requiredInputs) {
            if (!input.value.trim()) {
                input.focus();
                alert('Please fill out all required fields.');
                return false;
            }
        }
        return true;
    }

    // Next Buttons
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            
            // Domain validation check if step 3
            if (currentStep === 3) {
                const checkboxes = document.querySelectorAll('input[name="domains"]:checked');
                const errorMsg = document.getElementById('domain-error');
                if (checkboxes.length === 0 || checkboxes.length > 2) {
                    errorMsg.style.display = 'block';
                    return;
                } else {
                    errorMsg.style.display = 'none';
                }

                // Prepare Step 4 with dynamic challenges
                captureDataForCurrentStep();
                generateDomainChallenges();
            }

            if (validateStep()) {
                captureDataForCurrentStep();
                currentStep++;
                updateWizard();
            }
        });
    });

    // Prev Buttons
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateWizard();
        });
    });

    // Generate Dynamic Challenges for Step 4
    function generateDomainChallenges() {
        const container = document.getElementById('dynamic-challenges-container');
        container.innerHTML = ''; // Clear previous
        
        const selectedDomains = applicationData['domains'] || [];
        
        selectedDomains.forEach(domain => {
            const question = domainChallenges[domain];
            if (question) {
                const group = document.createElement('div');
                group.className = 'form-group';
                
                const label = document.createElement('label');
                label.innerText = `[${domain}] ${question}`;
                
                const textarea = document.createElement('textarea');
                textarea.name = `challenge_${domain.replace(/\s+/g, '_')}`;
                textarea.rows = 4;
                textarea.required = true;
                
                group.appendChild(label);
                group.appendChild(textarea);
                container.appendChild(group);
            }
        });
    }

    // Domain Checkbox Limit Enforcer (UI logic)
    const domainCheckboxes = document.querySelectorAll('input[name="domains"]');
    domainCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('input[name="domains"]:checked').length;
            if (checkedCount > 2) {
                cb.checked = false;
                document.getElementById('domain-error').innerText = "You can only select up to 2 domains.";
                document.getElementById('domain-error').style.display = 'block';
            } else {
                document.getElementById('domain-error').style.display = 'none';
            }
        });
    });

    // Submit Handling
    document.getElementById('final-submit-btn').addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!validateStep()) return;
        captureDataForCurrentStep();

        // Generate Application ID
        const randomID = Math.floor(1000 + Math.random() * 9000);
        const appId = `EC-2026-${randomID}`;
        document.getElementById('generated-app-id').innerText = appId;
        applicationData.appID = appId;

        // Log the application data object

        applicationData.appID = appId;

        applicationData.pitch = applicationData.pitch_q1;
        applicationData.tagline = applicationData.pitch_q2;

        console.log("Submission Data:", applicationData);
        
        // Fetch API request to Google Apps Script
        const appsScriptUrl = "https://script.google.com/macros/s/AKfycbyuiCp0wI4oQNE817fcaEiH0Vv2GWN_Zl5g58S4X-XGW0BDXwKmt8cg_fhheUabrZyTtQ/exec";

        try {
            fetch(appsScriptUrl, {
                method: 'POST',
                mode: 'no-cors', // typically needed for Apps Script
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(applicationData)
            }).then(() => {
                console.log('Successfully sent to Google Apps Script');
            }).catch(err => {
                console.error('Error submitting application:', err);
            }).finally(() => {
                // Advance to Success Step regardless
                currentStep = 6;
                updateWizard();
            });
        } catch (error) {
            console.error('Synchronous error submitting application:', error);
            // Show success anyway for UX since it's a mock url
            currentStep = 6;
            updateWizard();
        }
    });
});
