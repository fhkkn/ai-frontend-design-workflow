"""Draw reproducible creative constraints; no network or file writes."""
import argparse
import hashlib
import json
import secrets

CATALOG_VERSION = 1
CATALOG = {
    "source": ["剧院节目单", "植物标本册", "机场时刻表", "爵士唱片内页", "建筑竞赛图板", "登山路线图", "编辑部校样", "天文观测日志", "工业仪表铭牌", "街头文化海报", "图书馆目录", "时装杂志"],
    "composition": ["非对称主次分区", "窄边注释与宽正文", "沿时间组织的纵向序列", "极端字号与尺度对比", "开放留白中的紧凑信息组", "跨栏标题连接不同内容", "索引驱动的逐层展开", "重复节奏中的单点打破", "围绕核心对象排列关联信息", "可对照的平行信息轨道", "连续段落与局部高密度区域", "由内容优先级决定不等宽区域"],
    "expression": ["冷静而精密", "直接而有力度", "轻巧而灵动", "安静而有触感", "节奏鲜明但不喧闹", "理性中保留手工痕迹", "开放而富有探索感", "克制但比例大胆", "温暖而清晰", "粗粝但组织严密", "具有档案与时间感", "鲜明且带有幽默感"],
    "interaction": ["将下一步行动作为视觉主角", "用定位和导航呈现内容关系", "以直接编辑减少跳转", "将变化前后并列比较", "按阅读需要逐步披露信息", "让状态变化清楚可见", "围绕一个核心任务组织操作", "用索引快速切换上下文", "让摘要与细节相互定位", "用清楚反馈形成操作节奏", "将当前对象与背景信息区分", "把确认结果留在操作发生处"],
}


def draw(seed, count):
    """Hash-rank unique values independently for stable, diverse combinations."""
    columns = {}
    for dimension, values in CATALOG.items():
        columns[dimension] = sorted(values, key=lambda value: hashlib.sha256(
            json.dumps([CATALOG_VERSION, seed, dimension, value], ensure_ascii=False).encode("utf-8")
        ).digest())[:count]
    return {
        "catalog_version": CATALOG_VERSION,
        "seed": seed,
        "combinations": [{"id": index + 1, **{dimension: values[index] for dimension, values in columns.items()}} for index in range(count)],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", help="Omit for an OS-generated random seed.")
    parser.add_argument("--count", type=int, default=6, help="Number of combinations (1–12).")
    args = parser.parse_args()
    if not 1 <= args.count <= min(map(len, CATALOG.values())):
        parser.error("--count must be between 1 and 12")
    seed = args.seed if args.seed is not None else secrets.token_hex(8)
    print(json.dumps(draw(seed, args.count), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
