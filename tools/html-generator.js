/**
 * HTML Profile Generator
 * 用于根据 team-members.json 数据生成团队成员的 HTML 个人页面
 * 
 * 使用方法:
 * 1. 安装依赖: npm install fs path
 * 2. 运行: node html-generator.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const TEAM_DATA_FILE = path.join(__dirname, '../data/team-members.json');
const PEOPLE_DIR = path.join(__dirname, '../data/people');

// 读取团队数据
let teamData;
try {
  const teamDataJson = fs.readFileSync(TEAM_DATA_FILE, 'utf8');
  teamData = JSON.parse(teamDataJson);
} catch (error) {
  console.error('Error reading team data:', error);
  process.exit(1);
}

// HTML 模板
function generateHtml(member) {
  // 处理角色信息
  const roleHtml = member.role.map((role, index) => {
    if (index === 0 && role.highlighted) {
      return `<p><b style="color:#1565C0;">${role.text}</b></p>`;
    } else {
      return `<p>${role.highlighted ? `<b>${role.text}</b>` : role.text}</p>`;
    }
  }).join('\n                        ');

  // 处理社交链接
  const socialLinksHtml = member.socialLinks.map(link => {
    return `<a href="${link.url}" ${link.url.startsWith('http') ? 'target="_blank"' : ''} title="${link.title}"><i class="${link.icon}"></i></a>`;
  }).join('\n                        ');

  // 处理研究兴趣
  const interestsHtml = member.interests.map(interest => {
    return `<span class="interest-tag">${interest}</span>`;
  }).join('\n                    ');

  // 处理传记
  const biographyParagraphs = member.biography.split('\n\n').map(para => {
    return para.trim() ? `<p>${para.trim()}</p>` : '';
  }).join('\n                ');

  // 处理教育经历
  let educationHtml = '';
  if (member.education && member.education.length > 0) {
    educationHtml = `
            <div class="profile-section">
                <h2>Education</h2>
                <ul class="education-list">
                    ${member.education.map(edu => `
                    <li>
                        <strong>${edu.degree}</strong><br>
                        ${edu.institution}, ${edu.year}
                    </li>`).join('\n                    ')}
                </ul>
            </div>`;
  }

  // 生成头像路径
  const avatarPath = path.basename(member.avatar);
  // 输出文件所在目录
  const outputDir = path.dirname(path.join(__dirname, '..', member.detailPage));
  // 确保头像路径正确
  let avatarSrc = avatarPath;
  if (!member.avatar.includes(outputDir)) {
    // 如果头像不在当前目录中，使用完整路径
    avatarSrc = `../../../${member.avatar}`;
  }

  // 生成HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${member.title} - JC STEM Lab of Smart City</title>
    <link rel="stylesheet" href="../../../styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .profile-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .profile-header {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 40px;
            gap: 30px;
        }
        .profile-avatar {
            width: 250px;
            height: 250px;
            border-radius: 8px;
            object-fit: cover;
            border: none;
        }
        .profile-info {
            flex: 1;
            min-width: 300px;
        }
        .profile-info h1 {
            color: #1565C0;
            margin-bottom: 10px;
            font-size: 2.2rem;
        }
        .profile-role {
            margin-bottom: 15px;
            font-size: 1.1rem;
            line-height: 1.6;
        }
        .profile-affiliations {
            margin-bottom: 15px;
        }
        .profile-affiliations a {
            color: #1565C0;
            text-decoration: none;
        }
        .profile-affiliations a:hover {
            text-decoration: underline;
        }
        .profile-contacts {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        .profile-contacts a {
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
            background-color: rgba(0, 102, 204, 0.05);
            width: 42px;
            height: 42px;
        }
        .profile-contacts a i {
            color: #1565C0;
            font-size: 1.8rem;
        }
        .profile-contacts a:hover {
            background-color: rgba(0, 102, 204, 0.15);
            transform: translateY(-3px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .profile-section {
            margin-bottom: 30px;
        }
        .profile-section h2 {
            color: #1565C0;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .profile-section p {
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 15px;
        }
        .interests-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        .interest-tag {
            background-color: #e3f2fd;
            color: #1565C0;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
        }
        .education-list {
            list-style: none;
            padding: 0;
        }
        .education-list li {
            margin-bottom: 15px;
            line-height: 1.6;
        }
        .back-link {
            display: inline-block;
            margin-top: 30px;
            color: #1565C0;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <div class="profile-info">
                    <!-- Profile info will be loaded from JSON -->
                </div>
                <div class="profile-image">
                    <img src="../../../assets/group2.jpg" alt="JC STEM Lab" id="profile-img">
                </div>
            </div>
        </div>
    </header>

    <nav>
        <div class="container">
            <ul class="nav-links">
                <li><a href="../../../index.html">Home</a></li>
                <li><a href="../../../pages/team.html">Team</a></li>
                <li><a href="#" class="active">${member.title.split(',')[0]}</a></li>
            </ul>
        </div>
    </nav>

    <main>
        <div class="profile-container">
            <div class="profile-header">
                <img src="${avatarSrc}" alt="${member.title}" class="profile-avatar">
                <div class="profile-info">
                    <h1>${member.title}</h1>
                    <div class="profile-role">
                        ${roleHtml}
                    </div>
                    <div class="profile-contacts">
                        ${socialLinksHtml}
                    </div>
                </div>
            </div>

            ${member.interests && member.interests.length > 0 ? `
            <div class="profile-section">
                <h2>Research Interests</h2>
                <div class="interests-list">
                    ${interestsHtml}
                </div>
            </div>` : ''}

            ${member.biography ? `
            <div class="profile-section">
                <h2>Biography</h2>
                ${biographyParagraphs}
            </div>` : ''}

            ${educationHtml}

            <a href="../../../pages/team.html" class="back-link">← Back to Team</a>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; <span id="copyright-year"></span> JC STEM Lab of Smart City. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Set copyright year
        document.getElementById('copyright-year').textContent = new Date().getFullYear();
        
        // Mobile navigation horizontal scroll handling
        document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                // Check if scrollable
                const checkScrollable = () => {
                    const isScrollable = navLinks.scrollWidth > navLinks.clientWidth;
                    document.querySelector('nav .container').classList.toggle('has-scroll', isScrollable);
                };
                
                // Check on load and resize
                checkScrollable();
                window.addEventListener('resize', checkScrollable);
                
                // Scroll to active link
                const activeLink = navLinks.querySelector('a.active');
                if (activeLink) {
                    const activeLi = activeLink.closest('li');
                    if (activeLi) {
                        setTimeout(() => {
                            // Center the active link
                            const scrollPos = activeLi.offsetLeft - (navLinks.clientWidth / 2) + (activeLi.offsetWidth / 2);
                            navLinks.scrollLeft = Math.max(0, scrollPos);
                        }, 100);
                    }
                }
            }
        });
        
        // Load profile info from JSON
        fetch('../../../data/profile-info.json')
            .then(response => response.json())
            .then(data => {
                const profileInfo = document.querySelector('.header-content .profile-info');
                
                // Create and set name
                const name = document.createElement('h1');
                name.innerHTML = data.name;
                profileInfo.appendChild(name);
                
                // Create and set subtitle
                const subtitle = document.createElement('p');
                subtitle.className = 'subtitle';
                subtitle.innerHTML = data.subtitle;
                profileInfo.appendChild(subtitle);
                
                // Create contact info container
                const contactInfo = document.createElement('div');
                contactInfo.className = 'contact-info';
                
                // Add social links
                data.socialLinks.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.url.startsWith('assets/') ? '../../../' + link.url : link.url;
                    a.innerHTML = link.icon;
                    if (link.target) {
                        a.target = link.target;
                    }
                    contactInfo.appendChild(a);
                });
                
                profileInfo.appendChild(contactInfo);
            })
            .catch(error => console.error('Error loading profile info:', error));
    </script>
</body>
</html>`;
}

// 生成所有团队成员的HTML页面
function generateAllMembersHtml() {
  let generatedCount = 0;
  
  // 遍历所有类别和子类别
  teamData.categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.members.forEach(member => {
        try {
          // 只有当detailPage字段有值时才生成HTML
          if (member.detailPage) {
            const outputPath = path.join(__dirname, '..', member.detailPage);
            const outputDir = path.dirname(outputPath);
            
            // 确保输出目录存在
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }
            
            // 生成HTML内容
            const htmlContent = generateHtml(member);
            
            // 写入文件
            fs.writeFileSync(outputPath, htmlContent);
            generatedCount++;
            console.log(`Generated HTML for ${member.title} at ${outputPath}`);
          }
        } catch (error) {
          console.error(`Error generating HTML for ${member.title}:`, error);
        }
      });
    });
  });
  
  console.log(`Generation complete. Created ${generatedCount} HTML files.`);
}

// 执行生成
generateAllMembersHtml(); 