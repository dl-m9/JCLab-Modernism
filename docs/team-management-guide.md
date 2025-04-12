# 团队成员管理指南

本文档说明如何使用基于 JSON 数据的团队成员管理系统。这个系统可以让您轻松添加、编辑和删除团队成员，无需为每个成员创建单独的 HTML 页面。

## 系统概述

该系统由以下组件组成：

1. **数据存储**：`data/team-members.json` - 包含所有团队成员的结构化数据
2. **自动渲染**：`js/team-loader.js` - 负责从 JSON 加载数据并动态渲染团队页面
3. **转换工具**：`tools/member-parser.js` - 可以将 _index.md 文件转换为 JSON 格式数据
4. **页面模板**：`pages/team.html` - 使用 JavaScript 动态生成内容的页面模板

## 添加新成员

### 方法一：直接编辑 JSON 文件（推荐）

1. 打开 `data/team-members.json` 文件
2. 找到相应的类别和子类别（例如 "Meet Our Team" -> "Current PhD Students"）
3. 在 `members` 数组中添加新成员对象，格式如下：

```json
{
  "id": "unique-member-id",
  "title": "Mr./Dr./Prof. LAST_NAME, First_name",
  "role": [
    {"text": "PhD Student", "highlighted": true},
    {"text": "BSc @ University Name", "highlighted": false}
  ],
  "avatar": "data/people/FolderName/avatar.jpg",
  "socialLinks": [
    {"type": "homepage", "url": "https://example.com", "icon": "fas fa-globe", "title": "Homepage"},
    {"type": "email", "url": "mailto:email@example.com", "icon": "fas fa-envelope", "title": "Email"}
  ],
  "interests": [
    "Research Interest 1",
    "Research Interest 2"
  ],
  "biography": "Brief biography text.",
  "education": [
    {
      "degree": "PhD in Subject",
      "institution": "University Name",
      "year": "2020 - Present"
    }
  ],
  "detailPage": "data/people/FolderName/index.html"
}
```

4. 保存文件后，页面会自动加载新成员信息

### 方法二：使用 _index.md 文件和解析工具

1. 创建一个新文件夹：`data/people/Your_Member_Folder`
2. 在该文件夹中创建 `_index.md` 文件，使用以下格式：

```markdown
---
# TODO:Display name 必填
title: Prof. LAST_NAME, First_name

# TODO:Full name (for SEO) 必填
first_name: First_name   
last_name: last_name

# 不用管这个
authors:
  # 

# 不变
superuser: false

# TODO:这里可以简单介绍下自己 必填
role: <b>PhD Student <br> Department of Computer Science, <br> City University of Hong Kong</b>

# TODO:Organizations/Affiliations 必填
organizations:
  - name: City University of Hong Kong
    url: https://www.cityu.edu.hk/
  - name: Homepage  # 写自己的主页链接，如果没有则注释掉
    url: https://example.com/

# TODO:这块可以附上自己的链接，社交媒体，邮箱，google scholar, CV等，不想要的注释掉即可
social:
  - icon: envelope  # 邮箱
    icon_pack: fas
    link: 'mailto:email@example.com'
  - icon: google-scholar  # google scholar
    icon_pack: ai
    link: https://scholar.google.com/citations?user=ID
  - icon: house-user  # 自己的主页链接
    icon_pack: fas
    link: https://example.com/

# TODO:这块是自己的研究兴趣
interests:
  - Research Interest 1
  - Research Interest 2
  - Research Interest 3

# TODO:这块是自己的教育经历
education:
  courses:
    - course: PhD in Subject
      institution: University Name
      year: 2020 - Present
    - course: BSc in Subject
      institution: Another University
      year: 2016 - 2020
      
# TODO:选一个自己的身份
user_groups:
  # - Faculty
  # - Postdoctoral Researchers
  - PhDs
  # - Visiting Students
  # - Former Postdoctoral Researcher
---
<!-- TODO:写自己的Biography -->
# Biography

Your biography text goes here. This should be a brief introduction about yourself, your research interests, and your academic journey.
```

3. 在同一文件夹中添加 `avatar.jpg` 作为成员头像
4. 使用解析工具生成 JSON 数据：
   ```bash
   cd tools
   npm install fs path front-matter glob  # 安装依赖
   node member-parser.js                 # 运行解析工具
   ```

5. 工具会自动将成员信息添加到 `data/team-members.json` 文件中

## 编辑现有成员

1. 打开 `data/team-members.json` 文件
2. 找到要编辑的成员对象
3. 修改相应字段
4. 保存文件

## 删除成员

1. 打开 `data/team-members.json` 文件
2. 找到要删除的成员对象
3. 删除整个成员对象
4. 保存文件

## 字段说明

- **id**: 成员唯一标识符，通常使用文件夹名称
- **title**: 成员显示名称，通常格式为 "Mr./Dr./Prof. LAST_NAME, First_name"
- **role**: 成员角色数组，每个角色对象包含 text 和 highlighted 字段
  - **text**: 角色文字描述
  - **highlighted**: 是否高亮显示（通常第一个角色为 true）
- **avatar**: 成员头像图片路径
- **socialLinks**: 社交媒体链接数组
  - **type**: 链接类型
  - **url**: 链接地址
  - **icon**: Font Awesome 图标类名
  - **title**: 悬停提示文字
- **interests**: 研究兴趣数组
- **biography**: 成员简介文本
- **education**: 教育经历数组
  - **degree**: 学位
  - **institution**: 机构名称
  - **year**: 年份或时间范围
- **detailPage**: 成员详情页面路径（如果存在）

## 自定义团队类别

如需添加新的团队类别或子类别，请编辑 `data/team-members.json` 文件的 `categories` 数组。

每个类别对象格式如下：

```json
{
  "name": "Category Name",
  "subcategories": [
    {
      "name": "Subcategory Name",
      "members": []
    }
  ]
}
```

## 注意事项

1. 确保 JSON 格式正确，任何语法错误都可能导致页面无法加载
2. 成员头像建议使用正方形图片，系统会自动调整为 1:1 比例
3. 所有路径均相对于网站根目录
4. 社交媒体图标使用 [Font Awesome 6](https://fontawesome.com/icons) 图标

如有任何问题，请联系网站管理员。 