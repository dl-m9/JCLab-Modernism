/**
 * Member Parser Tool
 * 用于解析 _index.md 文件并生成 JSON 数据
 * 
 * 使用方法:
 * 1. 安装依赖: npm install fs path front-matter glob
 * 2. 运行: node member-parser.js
 */

const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');
const glob = require('glob');

// 配置
const PEOPLE_DIR = path.join(__dirname, '../data/people');
const OUTPUT_FILE = path.join(__dirname, '../data/team-members.json');
const AVATAR_DEFAULT = 'assets/default-avatar.jpg';

// 用户组映射到类别
const userGroupMapping = {
  'Faculty': { category: 'Meet Our Team', subcategory: 'Faculty' },
  'Postdoctoral Researchers': { category: 'Meet Our Team', subcategory: 'Postdoctoral Researchers' },
  'PhDs': { category: 'Meet Our Team', subcategory: 'Current PhD Students' },
  'Visiting Students': { category: 'Meet Our Team', subcategory: 'Visiting Students' },
  'Former Postdoctoral Researcher': { category: 'Former Members (@CityUHK)', subcategory: 'Former Postdoctoral Researchers' },
  'Former Visiting Student': { category: 'Former Members (@CityUHK)', subcategory: 'Former Visiting Students' },
  'Graduated PhD Students': { category: 'Former Members (@University of Florida)', subcategory: 'Graduated PhD Students' },
  'Graduated Master Students': { category: 'Former Members (@University of Florida)', subcategory: 'Graduated Master Students' },
  'Former Postdoctoral Researchers': { category: 'Former Members (@University of Florida)', subcategory: 'Former Postdoctoral Researchers' },
  'Former Visiting Scholars': { category: 'Former Members (@University of Florida)', subcategory: 'Former Visiting Scholars' },
  'Former Visiting Students': { category: 'Former Members (@University of Florida)', subcategory: 'Former Visiting Students' }
};

// 社交媒体图标映射
const socialIconMapping = {
  'envelope': { icon: 'fas fa-envelope', title: 'Email' },
  'google-scholar': { icon: 'fas fa-graduation-cap', title: 'Google Scholar' },
  'house-user': { icon: 'fas fa-globe', title: 'Homepage' },
  'github': { icon: 'fab fa-github', title: 'GitHub' },
  'linkedin': { icon: 'fab fa-linkedin', title: 'LinkedIn' },
  'twitter': { icon: 'fab fa-twitter', title: 'Twitter' },
  'cv': { icon: 'fas fa-file-pdf', title: 'CV' }
};

// 初始化团队数据结构
const teamData = {
  categories: [
    {
      name: 'Meet Our Team',
      subcategories: [
        { name: 'Faculty', members: [] },
        { name: 'Postdoctoral Researchers', members: [] },
        { name: 'Current PhD Students', members: [] },
        { name: 'Visiting Students', members: [] }
      ]
    },
    {
      name: 'Former Members (@CityUHK)',
      subcategories: [
        { name: 'Former Postdoctoral Researchers', members: [] },
        { name: 'Former Visiting Students', members: [] }
      ]
    },
    {
      name: 'Former Members (@University of Florida)',
      subcategories: [
        { name: 'Graduated PhD Students', members: [] },
        { name: 'Graduated Master Students', members: [] },
        { name: 'Former Postdoctoral Researchers', members: [] },
        { name: 'Former Visiting Scholars', members: [] },
        { name: 'Former Visiting Students', members: [] }
      ]
    }
  ]
};

// 获取所有成员目录
function findMemberFolders() {
  return new Promise((resolve, reject) => {
    glob(`${PEOPLE_DIR}/*/_index.md`, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

// 解析 _index.md 文件
function parseMemberFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = frontMatter(content);
    const data = parsed.attributes;
    
    // 获取成员目录名称
    const dirName = path.basename(path.dirname(filePath));
    
    // 创建成员对象
    const member = {
      id: dirName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: data.title || `Unknown (${dirName})`,
      role: parseRole(data.role),
      avatar: getAvatarPath(path.dirname(filePath)),
      socialLinks: parseSocialLinks(data.social),
      interests: data.interests || [],
      biography: parseBiography(parsed.body),
      education: parseEducation(data.education),
      detailPage: `data/people/${dirName}/index.html`,
      // 添加last_name字段用于排序
      last_name: data.last_name || data.title?.split(' ').pop() || ''
    };
    
    return { member, userGroup: data.user_groups ? data.user_groups[0] : 'Unknown' };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

// 解析角色信息
function parseRole(roleText) {
  if (!roleText) return [];
  
  // 如果是包含HTML的字符串，提取文本内容
  if (typeof roleText === 'string') {
    // 替换HTML标签
    let cleanText = roleText.replace(/<\/?[^>]+(>|$)/g, '');
    
    // 处理所有可能的分隔符: 换行, 逗号, 两个或更多空格
    // 使用正则表达式匹配所有这些分隔符
    const roleEntries = cleanText
      .split(/\n|,|\s{2,}/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // 第一项高亮显示，其他项不高亮
    return roleEntries.map((text, index) => ({
      text,
      highlighted: index === 0
    }));
  }
  
  return [];
}

// 获取头像路径
function getAvatarPath(memberDir) {
  // Check for common avatar filenames first
  const commonFilenames = ['avatar', 'photo', 'profile', 'image', 'portrait', 'headshot'];
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  // First try common avatar filenames
  for (const filename of commonFilenames) {
    for (const ext of extensions) {
      const avatarPath = path.join(memberDir, filename + ext);
      if (fs.existsSync(avatarPath)) {
        return `${path.relative(path.join(__dirname, '..'), memberDir)}/${filename}${ext}`;
      }
    }
  }
  
  // If no common filenames found, look for any image file in the directory
  try {
    const files = fs.readdirSync(memberDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        return `${path.relative(path.join(__dirname, '..'), memberDir)}/${file}`;
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${memberDir}:`, error);
  }
  
  // Fall back to default avatar if no image found
  return AVATAR_DEFAULT;
}

// 解析社交链接
function parseSocialLinks(socialData) {
  if (!socialData || !Array.isArray(socialData)) return [];
  
  return socialData.map(item => {
    const iconInfo = socialIconMapping[item.icon] || { icon: 'fas fa-link', title: 'Link' };
    
    return {
      type: item.icon,
      url: item.link,
      icon: iconInfo.icon,
      title: iconInfo.title
    };
  });
}

// 解析Biography部分
function parseBiography(bodyContent) {
  if (!bodyContent) return '';
  
  // 移除Markdown标题
  let bio = bodyContent.replace(/^#\s+Biography\s*$/m, '').trim();
  
  // 移除HTML注释
  bio = bio.replace(/<!--[\s\S]*?-->/g, '');
  
  // 移除可能的p标签
  bio = bio.replace(/<\/?p[^>]*>/g, '');
  
  // 返回整个biography内容，不再只取第一段落
  return bio;
}

// 解析教育经历
function parseEducation(educationData) {
  if (!educationData || !educationData.courses) return [];
  
  return educationData.courses.map(course => ({
    degree: course.course,
    institution: course.institution,
    year: course.year
  }));
}

// 将成员添加到数据结构中
function addMemberToTeamData(member, userGroup) {
  const mapping = userGroupMapping[userGroup] || { category: 'Meet Our Team', subcategory: 'Current PhD Students' };
  
  // 查找类别
  const categoryIndex = teamData.categories.findIndex(cat => cat.name === mapping.category);
  if (categoryIndex === -1) return;
  
  // 查找子类别
  const subcategoryIndex = teamData.categories[categoryIndex].subcategories.findIndex(
    subcat => subcat.name === mapping.subcategory
  );
  if (subcategoryIndex === -1) return;
  
  // 添加成员
  teamData.categories[categoryIndex].subcategories[subcategoryIndex].members.push(member);
}

// 根据last_name对成员排序
function sortMembersByLastName() {
  for (const category of teamData.categories) {
    for (const subcategory of category.subcategories) {
      subcategory.members.sort((a, b) => {
        // 默认按last_name字段排序
        return a.last_name.localeCompare(b.last_name, 'en', { sensitivity: 'base' });
      });
    }
  }
}

// 主函数
async function main() {
  try {
    const files = await findMemberFolders();
    console.log(`Found ${files.length} member files`);
    
    // 遍历文件并解析
    for (const file of files) {
      const result = parseMemberFile(file);
      if (result) {
        addMemberToTeamData(result.member, result.userGroup);
      }
    }
    
    // 对所有成员按last_name排序
    sortMembersByLastName();
    
    // 写入数据文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(teamData, null, 2));
    console.log(`Team data has been written to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// 启动程序
main(); 