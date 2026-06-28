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
    const submitBtn = document.getElementById('final-submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
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
    }

    /* ===== Vanilla Tilt Init ===== */
    VanillaTilt.init(document.querySelectorAll(".glass-card, .domain-card"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
    });

    /* ===== Custom Cursor ===== */
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('a, button, .checkbox-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    /* ===== Dynamic Domain Pages Logic ===== */
    const domainDetails = {
        "marketing": {
            icon: "📈",
            title: "Marketing & Branding",
            subtitle: "Craft the narrative and grow our audience.",
            field: "Marketing in a startup ecosystem is about more than just running ads; it's about building a cult-like following. You are the voice of E-Cell NIET. You will craft narratives, build anticipation, and ensure our events reach the right people at the right time.",
            responsibilities: [
                "Develop and execute comprehensive marketing campaigns for flagship events.",
                "Build and manage the brand identity of E-Cell NIET.",
                "Analyze engagement metrics to optimize future marketing strategies.",
                "Collaborate with the design team to ensure visual consistency."
            ],
            candidate: "You are persuasive, analytical, and highly creative. You know how to capture attention in a noisy digital world and can write copy that converts."
        },
        "technical": {
            icon: "💻",
            title: "Technical Team",
            subtitle: "Build scalable products and platforms.",
            field: "The technical team is the backbone of our digital presence. From building platforms for recruitment to creating tools that our internal teams use to operate efficiently, you will solve real-world problems through code.",
            responsibilities: [
                "Provide technical infrastructure and seamless digital experiences for all E-Cell events and hackathons.",
                "Build scalable applications for event registrations and management.",
                "Ensure website security, performance, and responsive design.",
                "Explore new technologies (Web3, AI) to implement in our workflows."
            ],
            candidate: "You are a problem solver who loves writing clean code. You know React, Node, or just pure Javascript, and are always eager to learn the next big tech stack."
        },
        "design": {
            icon: "🎨",
            title: "Design & Creative",
            subtitle: "Design premium experiences and visual identities.",
            field: "Design dictates how people perceive us. In this domain, you will translate abstract concepts into stunning visual realities. You set the aesthetic standard for everything E-Cell produces.",
            responsibilities: [
                "Create high-quality graphics, posters, and UI/UX mockups.",
                "Design merchandise, ID cards, and official E-Cell documents.",
                "Maintain a consistent, premium visual language across all platforms.",
                "Produce visually compelling pitch decks and reports."
            ],
            candidate: "You have an impeccable eye for detail, color, and typography. You know your way around Figma, Illustrator, or Photoshop, and believe that good design is good business."
        },
        "operations": {
            icon: "⚙️",
            title: "Operations & Management",
            subtitle: "Ensure smooth execution of high-impact events.",
            field: "Ideas are cheap; execution is everything. The Operations team is the engine room of E-Cell. You ensure that our ambitious plans actually happen, on time, and perfectly orchestrated.",
            responsibilities: [
                "Plan and execute event logistics, from venue booking to crowd control.",
                "Manage internal team communications and workflows.",
                "Handle the supply chain for merchandise and event materials.",
                "Troubleshoot on-ground problems in real-time during major events."
            ],
            candidate: "You are organized, calm under pressure, and highly reliable. You are a natural leader who knows how to delegate and get things done when the clock is ticking."
        },
        "social-media": {
            icon: "📱",
            title: "Social Media & Content",
            subtitle: "Engage the community through viral content.",
            field: "Social media is our primary touchpoint with the student community. This team is responsible for keeping E-Cell relevant, engaging, and top-of-mind through high-quality, shareable content.",
            responsibilities: [
                "Manage Instagram, LinkedIn, and Twitter accounts daily.",
                "Script, shoot, and edit short-form video content (Reels/Shorts).",
                "Write engaging captions, threads, and newsletters.",
                "Stay on top of internet trends and adapt them for our brand."
            ],
            candidate: "You live on the internet. You understand algorithms, know what makes a video go viral, and have a knack for storytelling. Video editing skills are a huge plus."
        },
        "sponsorship": {
            icon: "🤝",
            title: "Sponsorship & Corporate Relations",
            subtitle: "Secure funding and manage corporate partnerships.",
            field: "No event happens without capital. This team is the financial lifeblood of E-Cell. You will interact directly with corporate executives, negotiate deals, and secure the resources we need to build big.",
            responsibilities: [
                "Pitch to potential sponsors and secure funding for events.",
                "Draft professional sponsorship brochures and proposals.",
                "Maintain long-term relationships with corporate partners.",
                "Ensure sponsor deliverables (brand visibility, stalls) are met during events."
            ],
            candidate: "You are highly articulate, confident, and not afraid of rejection. You have excellent professional communication skills (written and verbal) and a strong business acumen."
        },
        "outreach": {
            icon: "🚀",
            title: "Startup Outreach",
            subtitle: "Connect with emerging founders and startups.",
            field: "E-Cell is nothing without its network. The Outreach team bridges the gap between our campus and the actual startup ecosystem, bringing in founders, investors, and mentors.",
            responsibilities: [
                "Identify and invite startup founders, VCs, and industry experts as speakers.",
                "Build partnerships with other incubators and E-Cells across India.",
                "Manage guest relations and ensure a premium experience for speakers.",
                "Curate panels and workshops with relevant industry leaders."
            ],
            candidate: "You are a master networker. You know how to write cold emails that get responses, and you have a genuine interest in the startup ecosystem and its key players."
        },
        "research": {
            icon: "🔬",
            title: "Research & Strategy",
            subtitle: "Analyze trends and develop growth strategies.",
            field: "The Strategy team dictates the long-term vision of E-Cell. You analyze what works, what doesn't, and what we should do next. You ensure that every action we take aligns with our core mission.",
            responsibilities: [
                "Conduct market research on campus trends and student needs.",
                "Develop data-driven strategies for user acquisition (recruitment/events).",
                "Analyze the success/failure metrics of past events to improve future ones.",
                "Write deep-dive reports on startup sectors for our community."
            ],
            candidate: "You are highly analytical, curious, and love data. You think 10 steps ahead and prefer making decisions based on evidence rather than gut feeling."
        }
    };

    // Check if we are on the domain page
    if (window.location.pathname.includes('domain.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const domainId = urlParams.get('id');

        if (domainId && domainDetails[domainId]) {
            const data = domainDetails[domainId];
            
            // Populate DOM
            document.title = `${data.title} | E-Cell NIET`;
            document.getElementById('dom-icon').innerText = data.icon;
            
            const titleEl = document.getElementById('dom-title');
            titleEl.innerText = data.title;
            titleEl.setAttribute('data-text', data.title);
            
            document.getElementById('dom-subtitle').innerText = data.subtitle;
            document.getElementById('dom-field').innerText = data.field;
            document.getElementById('dom-candidate').innerText = data.candidate;
            
            const respList = document.getElementById('dom-responsibilities');
            respList.innerHTML = '';
            data.responsibilities.forEach(task => {
                const li = document.createElement('li');
                li.innerText = task;
                respList.appendChild(li);
            });
        } else {
            // Fallback if ID is invalid or missing
            document.getElementById('dom-title').innerText = "Domain Not Found";
            document.getElementById('dom-title').setAttribute('data-text', "Domain Not Found");
            document.getElementById('dom-subtitle').innerText = "Please go back and select a valid domain.";
            document.getElementById('dom-field').innerText = "N/A";
            document.getElementById('dom-candidate').innerText = "N/A";
            document.getElementById('dom-responsibilities').innerHTML = "<li>N/A</li>";
        }
    }

});
