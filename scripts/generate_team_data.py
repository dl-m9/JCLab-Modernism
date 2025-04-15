#!/usr/bin/env python3
"""
生成团队成员数据脚本

此脚本遍历data/people目录下的所有_index.md文件，
提取人员信息并生成一个JavaScript文件，该文件包含按last_name排序的团队成员数据。
"""

import os
import re
import yaml
import json
from pathlib import Path

# 定义目录路径
DATA_DIR = Path("../data/people")
OUTPUT_FILE = Path("../pages/team_data.js")

# 用户组映射
GROUP_MAPPING = {
    "Principal Investigators": "Faculty",
    "Researchers": "Faculty",
    "PhDs": "Current PhD Students",
    "Current PhD Students": "Current PhD Students",
    "Visitors": "Visiting Scholars",
    "Alumnis": "Former Members",
    "Postdoctors": "Postdoctoral Researchers",
    "Faculty": "Faculty",
    "Graduated PhD Students": "Former Members",
    "Former Postdoctoral Researchers": "Former Members",
    "Former Visitors": "Former Members",
}

# 图标映射
ICON_MAPPING = {
    "envelope": "fas fa-envelope",
    "twitter": "fab fa-twitter",
    "google-scholar": "ai fa-graduation-cap",
    "house-user": "fas fa-globe",
    "github": "fab fa-github",
    "cv": "ai fa-cv",
    "linkedin": "fab fa-linkedin",
}

def extract_front_matter(content):
    """从Markdown内容中提取YAML前置内容"""
    pattern = r"^---\s*$(.*?)^---\s*$"
    match = re.search(pattern, content, re.DOTALL | re.MULTILINE)
    if match:
        return match.group(1).strip()
    return ""

def extract_member_info(file_path):
    """从_index.md文件中提取成员信息"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 提取前置内容
        front_matter_str = extract_front_matter(content)
        if not front_matter_str:
            return None
            
        # 解析YAML
        front_matter = yaml.safe_load(front_matter_str)
        
        # 提取基本信息
        title = front_matter.get('title', '')
        first_name = front_matter.get('first_name', '')
        last_name = front_matter.get('last_name', '')
        role = front_matter.get('role', '').replace('<b>', '').replace('</b>', '')
        
        # 确定组别
        user_groups = front_matter.get('user_groups', [])
        group = "Former Members"  # 默认组
        if user_groups and isinstance(user_groups, list) and len(user_groups) > 0:
            raw_group = user_groups[0]
            group = GROUP_MAPPING.get(raw_group, "Former Members")
        
        # 提取社交媒体链接
        social = front_matter.get('social', [])
        links = []
        for item in social:
            if not item:
                continue
                
            icon = item.get('icon', '')
            icon_pack = item.get('icon_pack', '')
            link = item.get('link', '')
            
            if not link or not icon:
                continue
                
            # 格式化图标类名
            icon_class = ICON_MAPPING.get(icon, f"{icon_pack} fa-{icon}")
            
            # 确定链接标题
            title = "Link"
            if "envelope" in icon:
                title = "Email"
                if not link.startswith("mailto:"):
                    link = f"mailto:{link}"
            elif "google-scholar" in icon:
                title = "Google Scholar"
            elif "house-user" in icon or "globe" in icon:
                title = "Homepage"
            elif "github" in icon:
                title = "GitHub"
            elif "linkedin" in icon:
                title = "LinkedIn"
            elif "cv" in icon:
                title = "CV"
            
            # 确定链接是否在新窗口打开
            target = "_blank" if not ("mailto:" in link or "#" in link) else ""
            
            links.append({
                "icon": icon_class,
                "href": link,
                "title": title,
                "target": target
            })
        
        # 确定图像路径
        # 默认查找照片：assets/{last_name}.jpg 或 assets/{dirname}.jpg
        dirname = os.path.basename(os.path.dirname(file_path))
        image_path = f"../assets/{last_name}.jpg"
        if not os.path.exists(f"../assets/{last_name}.jpg"):
            image_path = f"../assets/{dirname.lower()}.jpg"
            if not os.path.exists(f"../assets/{dirname.lower()}.jpg"):
                # 如果是PhD学生，尝试使用不同的名称格式
                if "PhD" in dirname:
                    name_parts = dirname.split('_')
                    if len(name_parts) > 1:
                        student_name = name_parts[1].lower()
                        if os.path.exists(f"../assets/{student_name}.jpg"):
                            image_path = f"../assets/{student_name}.jpg"
                        else:
                            # 尝试首字母小写
                            student_name_lower = student_name[0].lower() + student_name[1:]
                            if os.path.exists(f"../assets/{student_name_lower}.jpg"):
                                image_path = f"../assets/{student_name_lower}.jpg"
                            else:
                                image_path = "../assets/default-avatar.jpg"
                    else:
                        image_path = "../assets/default-avatar.jpg"
                else:
                    image_path = "../assets/default-avatar.jpg"
        
        # 返回成员信息对象
        return {
            "name": title,
            "role": role,
            "imageSrc": image_path,
            "group": group,
            "lastName": last_name,
            "links": links
        }
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return None

def generate_team_data():
    """生成团队成员数据"""
    members = []
    
    # 遍历data/people目录
    for root, dirs, files in os.walk(DATA_DIR):
        if "_index.md" in files:
            file_path = os.path.join(root, "_index.md")
            member_info = extract_member_info(file_path)
            if member_info:
                members.append(member_info)
    
    # 按last_name排序
    members.sort(key=lambda x: x.get("lastName", ""))
    
    # 生成JavaScript文件
    js_content = f"""// 自动生成的团队成员数据
// 由generate_team_data.py脚本生成于{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// 请勿手动修改此文件

const teamMembers = {json.dumps(members, indent=2)};
"""
    
    # 写入文件
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"已生成团队成员数据文件: {OUTPUT_FILE}")
    print(f"共计 {len(members)} 名成员")

if __name__ == "__main__":
    # 添加缺失的导入
    from datetime import datetime
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # 生成数据
    generate_team_data() 