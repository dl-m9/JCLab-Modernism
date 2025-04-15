// 团队成员数据处理脚本
// 注意：团队成员数据存储在team_data.js文件中
// 如需更新团队成员数据，请运行scripts/generate_team_data.py脚本
// 命令: cd scripts && python3 generate_team_data.py

// 按照用户组组织和显示团队成员
function displayTeamMembers() {
    // 确保teamMembers变量已定义（由team_data.js提供）
    if (typeof teamMembers === 'undefined') {
        console.error('错误：找不到团队成员数据。请确保已加载team_data.js文件。');
        return;
    }
    
    // 按照组别分类
    const groupedMembers = {
        "Faculty": [],
        "Current PhD Students": [],
        "Postdoctoral Researchers": [],
        "Visiting Scholars": [],
        "Former Members": []
    };
    
    // 将成员分类到各自的组
    teamMembers.forEach(member => {
        if (groupedMembers[member.group]) {
            groupedMembers[member.group].push(member);
        } else {
            // 如果组别不在预定义列表中，添加到"Former Members"
            groupedMembers["Former Members"].push(member);
        }
    });
    
    // 清空现有内容
    document.querySelectorAll('.team-members').forEach(container => {
        container.innerHTML = '';
    });
    
    // 显示分组成员
    for (const [group, members] of Object.entries(groupedMembers)) {
        if (members.length === 0) continue;
        
        // 查找对应的容器
        const container = findCategoryContainer(group);
        if (!container) continue;
        
        // 显示成员
        members.forEach(member => {
            const memberElement = createMemberElement(member);
            container.appendChild(memberElement);
        });
    }
}

// 查找分类容器
function findCategoryContainer(groupName) {
    const headings = document.querySelectorAll('.team-category h3');
    for (let i = 0; i < headings.length; i++) {
        if (headings[i].textContent.trim() === groupName) {
            return headings[i].closest('.team-category').querySelector('.team-members');
        }
    }
    return null;
}

// 创建团队成员的HTML元素
function createMemberElement(member) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'team-member';
    
    // 成员图像
    const img = document.createElement('img');
    img.src = member.imageSrc;
    img.alt = member.name;
    memberDiv.appendChild(img);
    
    // 成员姓名
    const nameHeader = document.createElement('h4');
    nameHeader.textContent = member.name;
    memberDiv.appendChild(nameHeader);
    
    // 成员角色
    const roleP = document.createElement('p');
    roleP.innerHTML = member.role;
    memberDiv.appendChild(roleP);
    
    // 成员链接
    const linksDiv = document.createElement('div');
    linksDiv.className = 'member-links';
    
    member.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.title = link.title;
        
        if (link.target) {
            a.target = link.target;
        }
        
        const i = document.createElement('i');
        i.className = link.icon;
        a.appendChild(i);
        
        linksDiv.appendChild(a);
    });
    
    memberDiv.appendChild(linksDiv);
    
    return memberDiv;
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 创建并添加默认头像
    createDefaultAvatar();
    
    // 显示团队成员
    displayTeamMembers();
});

// 创建默认头像（如果不存在）
function createDefaultAvatar() {
    if (!document.querySelector('img[src="../assets/default-avatar.jpg"]')) {
        const defaultAvatar = new Image();
        defaultAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSI0MCIgZmlsbD0iI2IwYjdiZiIvPjxwYXRoIGQ9Ik0xNjAsMTg1YzAsMC02MC01MC0xMjAsMGMwLDAsNS01MCw2MC01MEMxNTUsMTM1LDE2MCwxODUsMTYwLDE4NXoiIGZpbGw9IiNiMGI3YmYiLz48L3N2Zz4=';
        defaultAvatar.style.display = 'none';
        defaultAvatar.onload = function() {
            // 创建canvas保存图像
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(defaultAvatar, 0, 0, 200, 200);
            
            // 将图像保存为assets/default-avatar.jpg
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg');
            link.download = 'default-avatar.jpg';
            document.body.appendChild(link);
            
            // 这里仅生成基本的默认头像，需要手动保存到assets目录
            console.info('已生成默认头像。如需使用，请将图像保存到assets/default-avatar.jpg');
        };
        document.body.appendChild(defaultAvatar);
    }
} 