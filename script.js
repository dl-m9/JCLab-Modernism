document.addEventListener('DOMContentLoaded', function() {
    // Load profile information
    loadProfileInfo();

    // Publication filters - including "First Author" for publications where user is first author or has equal contribution
    const filterBtns = document.querySelectorAll('.filter-btn');
    const publications = document.querySelectorAll('.publication');
    
    // Load publications data from JSON file
    loadPublications();
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter publications
            const pubElements = document.querySelectorAll('.publication');
            pubElements.forEach(pub => {
                if (filterValue === 'all') {
                    pub.style.display = 'flex';
                } else if (pub.classList.contains(filterValue)) {
                    pub.style.display = 'flex';
                } else {
                    pub.style.display = 'none';
                }
            });
        });
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply smooth scrolling to hash links (internal page links)
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    // Update active class
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Load news data
    // Determine the correct path for news.json based on current page
    let newsJsonPath = 'data/news.json';
    if (window.location.pathname.includes('/pages/')) {
        // If we're in the pages directory, we need to go up one level
        newsJsonPath = '../data/news.json';
    }
    
    fetch(newsJsonPath)
        .then(response => response.json())
        .then(data => {
            // Check if we're on the homepage
            const latestNewsSection = document.getElementById('latest-news');
            if (latestNewsSection) {
                // On homepage - show limited news (first 8 items)
                renderNewsItems(data.slice(0, 8), 'news-container');
            }
            
            // Check if we're on the all-news page
            const allNewsSection = document.getElementById('all-news');
            if (allNewsSection) {
                // On all-news page - show all news items
                renderNewsItems(data, 'all-news-container');
            }
        })
        .catch(error => {
            console.error('Error loading news data:', error);
        });
});

// Function to load profile information
function loadProfileInfo() {
    let profileJsonPath = 'data/profile-info.json';
    let isSubpage = window.location.pathname.includes('/pages/');
    if (isSubpage) {
        profileJsonPath = '../data/profile-info.json';
    }

    // Get profile-info container
    const profileInfoContainer = document.querySelector('.profile-info');
    if (!profileInfoContainer) return;

    fetch(profileJsonPath)
        .then(response => response.json())
        .then(data => {
            // Clear existing content
            profileInfoContainer.innerHTML = '';
            
            // Add name
            const nameElement = document.createElement('h1');
            nameElement.textContent = data.name;
            profileInfoContainer.appendChild(nameElement);
            
            // Add subtitle
            const subtitleElement = document.createElement('p');
            subtitleElement.className = 'subtitle';
            subtitleElement.innerHTML = data.subtitle;
            profileInfoContainer.appendChild(subtitleElement);
            
            // Add social links container
            const contactInfo = document.createElement('div');
            contactInfo.className = 'contact-info';
            
            // Add each social link
            data.socialLinks.forEach(link => {
                const linkContainer = document.createElement('p');
                const anchor = document.createElement('a');
                // Adjust URL paths for subpages
                if (isSubpage && link.url.startsWith('assets/')) {
                    anchor.href = '../' + link.url;
                } else {
                    anchor.href = link.url;
                }
                
                if (link.target) {
                    anchor.target = link.target;
                }
                
                // Fix SVG icon paths for subpages
                let iconHtml = link.icon;
                if (isSubpage && link.type === 'dblp') {
                    iconHtml = iconHtml.replace('src="assets/', 'src="../assets/');
                }
                
                anchor.innerHTML = iconHtml;
                linkContainer.appendChild(anchor);
                contactInfo.appendChild(linkContainer);
            });
            
            profileInfoContainer.appendChild(contactInfo);
            
            // Update profile image if there's a profile-image container
            const profileImageContainer = document.querySelector('.profile-image img');
            if (profileImageContainer && data.profileImage) {
                profileImageContainer.src = isSubpage ? 
                    '../' + data.profileImage : data.profileImage;
                profileImageContainer.alt = data.name;
            }
        })
        .catch(error => {
            console.error('Error loading profile information:', error);
        });
}

// Function to load publications from JSON
function loadPublications() {
    let publicationsJsonPath = 'data/publications.json';
    if (window.location.pathname.includes('/pages/')) {
        publicationsJsonPath = '../data/publications.json';
    }

    const publicationsList = document.querySelector('.publications-list');
    if (!publicationsList) return;
    
    // Clear existing publications
    publicationsList.innerHTML = '';
    
    fetch(publicationsJsonPath)
        .then(response => response.json())
        .then(publications => {
            // Counter for auto-numbering publications
            let counter = 1;
            
            publications.forEach(pub => {
                const pubElement = document.createElement('div');
                const classes = ['publication', pub.type];
                if (pub.isFirstAuthor) classes.push('first-author');
                pubElement.className = classes.join(' ');
                
                // Create venue/type label for left side
                const venueElement = document.createElement('div');
                venueElement.className = 'pub-venue-label';
                
                // Determine what text to show in the left column
                let venueText = '';
                if (pub.type === 'preprint') {
                    venueText = 'Preprint';
                } else if (pub.venue) {
                    // Extract short venue name from the venue string or tags
                    const venueTag = pub.tags.find(tag => tag.class === 'venue-tag');
                    venueText = venueTag ? venueTag.text : pub.venue.split(',')[0].split(' ').pop();
                }
                
                // Create publication number - display in ascending order (1-15)
                const numberElement = document.createElement('span');
                numberElement.className = 'pub-number';
                numberElement.textContent = counter++;
                
                venueElement.appendChild(numberElement);
                
                // Add venue text below the number
                const venueTextElement = document.createElement('span');
                venueTextElement.className = 'venue-text';
                venueTextElement.textContent = venueText;
                venueElement.appendChild(venueTextElement);
                
                // Create publication content container
                const contentElement = document.createElement('div');
                contentElement.className = 'pub-content';
                
                // Add title
                const titleElement = document.createElement('h3');
                titleElement.textContent = pub.title;
                contentElement.appendChild(titleElement);
                
                // Add authors
                const authorsElement = document.createElement('p');
                authorsElement.className = 'authors';
                authorsElement.innerHTML = pub.authors;
                contentElement.appendChild(authorsElement);
                
                // Add full venue if it exists (for accepted papers)
                if (pub.venue) {
                    const fullVenueElement = document.createElement('p');
                    fullVenueElement.className = 'venue';
                    fullVenueElement.textContent = pub.venue;
                    contentElement.appendChild(fullVenueElement);
                }
                
                // Add tags
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'pub-tags';
                
                pub.tags.forEach(tag => {
                    // Skip venue tag as we're now showing it on the left
                    if (tag.class === 'venue-tag') return;
                    
                    if (tag.link) {
                        const tagLink = document.createElement('a');
                        tagLink.href = tag.link;
                        tagLink.className = `tag ${tag.class}`;
                        tagLink.textContent = tag.text;
                        tagLink.target = "_blank";
                        tagLink.rel = "noopener noreferrer";
                        tagsContainer.appendChild(tagLink);
                    } else {
                        const tagSpan = document.createElement('span');
                        tagSpan.className = `tag ${tag.class}`;
                        tagSpan.textContent = tag.text;
                        tagsContainer.appendChild(tagSpan);
                    }
                });
                
                contentElement.appendChild(tagsContainer);
                
                // Combine elements and add to publications list
                pubElement.appendChild(venueElement);
                pubElement.appendChild(contentElement);
                publicationsList.appendChild(pubElement);
            });
        })
        .catch(error => {
            console.error('Error loading publications data:', error);
        });
}

// Function to render news items
function renderNewsItems(newsData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Add each news item to the container
    newsData.forEach(newsItem => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        
        // Create the date element
        const dateElement = document.createElement('div');
        dateElement.className = 'news-date';
        
        const dateHighlight = document.createElement('span');
        dateHighlight.className = 'year-highlight';
        dateHighlight.textContent = newsItem.date;
        dateElement.appendChild(dateHighlight);
        
        // Create the content element
        const contentElement = document.createElement('div');
        contentElement.className = 'news-content';
        
        // Create the title element
        const titleElement = document.createElement('h3');
        
        // Check if title contains HTML (like '<a href=')
        if (newsItem.title && newsItem.title.includes('<a href=')) {
            // Parse HTML in title
            titleElement.innerHTML = newsItem.title;
        } else {
            titleElement.textContent = newsItem.title;
        }
        
        contentElement.appendChild(titleElement);
        
        // Create the paragraph for content
        const paragraphElement = document.createElement('p');
        paragraphElement.innerHTML = newsItem.content;
        
        // Add links if provided in the links array format
        if (newsItem.links && newsItem.links.length > 0) {
            newsItem.links.forEach(link => {
                // Add a space if needed
                const space = document.createTextNode(' ');
                paragraphElement.appendChild(space);
                
                // Create link
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.textContent = link.text;
                linkElement.target = "_blank";
                linkElement.rel = "noopener noreferrer";
                paragraphElement.appendChild(linkElement);
            });
        }
        
        // Check for old style link (backward compatibility)
        if (newsItem.link && newsItem.linkText) {
            const space = document.createTextNode(' ');
            paragraphElement.appendChild(space);
            
            const linkElement = document.createElement('a');
            linkElement.href = newsItem.link;
            linkElement.textContent = newsItem.linkText;
            linkElement.target = "_blank";
            linkElement.rel = "noopener noreferrer";
            paragraphElement.appendChild(linkElement);
        }
        
        contentElement.appendChild(paragraphElement);
        
        // Add date and content to the news item
        newsElement.appendChild(dateElement);
        newsElement.appendChild(contentElement);
        
        // Add the news item to the container
        container.appendChild(newsElement);
    });
} 