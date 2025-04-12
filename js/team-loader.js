/**
 * Team Members Loader
 * 动态从 JSON 文件加载团队成员数据并渲染到页面
 */

document.addEventListener('DOMContentLoaded', function() {
    loadTeamMembers();
    
    // 设置版权年份
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    
    // 处理导航栏水平滚动
    handleNavScrolling();
});

/**
 * 加载团队成员数据并渲染到页面
 */
function loadTeamMembers() {
    fetch('../data/team-members.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载团队成员数据: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            renderTeamStructure(data);
        })
        .catch(error => {
            console.error('加载团队成员数据时出错:', error);
            document.querySelector('main').innerHTML = `
                <div class="container text-center" style="padding: 50px 20px;">
                    <h2>加载数据时出错</h2>
                    <p>${error.message}</p>
                    <a href="../index.html" class="btn btn-primary">返回首页</a>
                </div>
            `;
        });
}

/**
 * 渲染整个团队结构
 * @param {Object} data - 团队成员数据
 */
function renderTeamStructure(data) {
    const mainContainer = document.querySelector('main');
    mainContainer.innerHTML = ''; // 清空现有内容
    
    // 创建主容器
    const sectionElement = document.createElement('section');
    sectionElement.className = 'section';
    
    const containerElement = document.createElement('div');
    containerElement.className = 'container';
    
    // 遍历主要类别
    data.categories.forEach(category => {
        // 如果是主要类别，不添加分隔标题
        if (category.name === "Meet Our Team") {
            containerElement.innerHTML += `<h2 class="section-title">${category.name}</h2>`;
        } else {
            // 为前成员类别添加分隔样式
            containerElement.innerHTML += `
                <div class="major-section">
                    <h2 class="major-section-title">${category.name}</h2>
                </div>
            `;
        }
        
        // 创建团队容器
        const teamContainer = document.createElement('div');
        teamContainer.className = 'team-container';
        
        // 渲染子类别
        category.subcategories.forEach(subcategory => {
            const subcategoryElement = document.createElement('div');
            subcategoryElement.className = 'team-category';
            
            subcategoryElement.innerHTML = `<h3>${subcategory.name}</h3>`;
            
            const membersContainer = document.createElement('div');
            membersContainer.className = 'team-members';
            
            // 检查是否有成员
            if (subcategory.members && subcategory.members.length > 0) {
                // 渲染成员卡片
                subcategory.members.forEach(member => {
                    membersContainer.appendChild(createMemberCard(member));
                });
            } else {
                // 显示空类别提示
                const emptyNote = getEmptyNoteForCategory(subcategory.name);
                membersContainer.innerHTML = `<p class="empty-category-note">${emptyNote}</p>`;
            }
            
            subcategoryElement.appendChild(membersContainer);
            teamContainer.appendChild(subcategoryElement);
        });
        
        containerElement.appendChild(teamContainer);
    });
    
    // 添加返回首页按钮
    containerElement.innerHTML += `
        <div class="back-to-home">
            <a href="../index.html" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Back to Homepage</a>
        </div>
    `;
    
    sectionElement.appendChild(containerElement);
    mainContainer.appendChild(sectionElement);
}

/**
 * 创建成员卡片
 * @param {Object} member - 成员数据
 * @returns {HTMLElement} 成员卡片元素
 */
function createMemberCard(member) {
    const memberCard = document.createElement('div');
    memberCard.className = 'team-member';
    
    // 头像
    const avatar = document.createElement('img');
    avatar.src = `../${member.avatar}`;
    avatar.alt = member.title;
    memberCard.appendChild(avatar);
    
    // 姓名和链接
    const nameElement = document.createElement('h4');
    nameElement.innerHTML = `<a href="../data/people/profile.html?id=${member.id}">${member.title}</a>`;
    memberCard.appendChild(nameElement);
    
    // 角色信息
    if (member.role && member.role.length > 0) {
        member.role.forEach((roleItem, index) => {
            const roleElement = document.createElement('p');
            
            // 判断是否为Prof. Fang的第一个角色项
            const isProfFangLabDirector = member.id === 'prof-fang' && index === 0;
            
            if (roleItem.highlighted) {
                // 高亮项始终加粗
                if (isProfFangLabDirector) {
                    // 仅Prof. Fang的第一个角色项保持蓝色高亮
                    roleElement.innerHTML = `<b style="color:#1565C0;">${roleItem.text}</b>`;
                } else {
                    // 其他成员的高亮项加粗但无特殊颜色
                    roleElement.innerHTML = `<b>${roleItem.text}</b>`;
                }
            } else {
                // 非高亮项不加粗
                roleElement.innerHTML = roleItem.text;
            }
            
            memberCard.appendChild(roleElement);
        });
    }
    
    // 社交链接
    if (member.socialLinks && member.socialLinks.length > 0) {
        const linksContainer = document.createElement('div');
        linksContainer.className = 'member-links';
        
        member.socialLinks.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.title = link.title;
            linkElement.innerHTML = `<i class="${link.icon}"></i>`;
            
            if (link.url.startsWith('http')) {
                linkElement.target = '_blank';
            }
            
            linksContainer.appendChild(linkElement);
        });
        
        memberCard.appendChild(linksContainer);
    }
    
    return memberCard;
}

/**
 * 根据类别名称获取空类别提示信息
 * @param {string} categoryName - 类别名称
 * @returns {string} 提示信息
 */
function getEmptyNoteForCategory(categoryName) {
    const messages = {
        "Postdoctoral Researchers": "Currently no postdoctoral researchers in the team.",
        "Visiting Students": "Currently no visiting students in the team.",
        "Former Visiting Students": "No former visiting students data available.",
        "Graduated PhD Students": "Graduated PhD students data will be added soon.",
        "Graduated Master Students": "Graduated Master students data will be added soon.",
        "Former Postdoctoral Researchers": "Former postdoctoral researchers data will be added soon.",
        "Former Visiting Scholars": "Former visiting scholars data will be added soon."
    };
    
    return messages[categoryName] || `No ${categoryName.toLowerCase()} available.`;
}

/**
 * 处理导航栏水平滚动
 */
function handleNavScrolling() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        // 检查是否可滚动
        const checkScrollable = () => {
            const isScrollable = navLinks.scrollWidth > navLinks.clientWidth;
            document.querySelector('nav .container').classList.toggle('has-scroll', isScrollable);
        };
        
        // 加载时和调整大小时检查
        checkScrollable();
        window.addEventListener('resize', checkScrollable);
        
        // 滚动到活动链接
        const activeLink = navLinks.querySelector('a.active');
        if (activeLink) {
            const activeLi = activeLink.closest('li');
            if (activeLi) {
                setTimeout(() => {
                    // 将活动链接居中
                    const scrollPos = activeLi.offsetLeft - (navLinks.clientWidth / 2) + (activeLi.offsetWidth / 2);
                    navLinks.scrollLeft = Math.max(0, scrollPos);
                }, 100);
            }
        }
    }
} 