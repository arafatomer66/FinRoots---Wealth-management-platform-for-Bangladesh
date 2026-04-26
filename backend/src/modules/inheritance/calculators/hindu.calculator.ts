/**
 * Hindu Inheritance Calculator — Dayabhaga School (Bangladesh)
 *
 * Rules:
 * - Equal division among children (sons and daughters inherit equally)
 * - Full testamentary freedom — can bequeath all property to anyone via will
 * - If no will: estate divided among children, then spouse, then parents
 * - Both self-acquired and inherited property can be willed
 */

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  gender: string;
}

interface ShareResult {
  memberId: number;
  name: string;
  relationship: string;
  percentage: number;
  amount: number;
  basis: string;
}

export function calculateHinduInheritance(
  estateValue: number,
  familyMembers: FamilyMember[],
  hasWill: boolean = false,
  willDistribution?: { memberId: number; percentage: number }[],
): { shares: ShareResult[]; notes: string[] } {
  const notes: string[] = [];

  // If there's a will, follow it completely (full testamentary freedom)
  if (hasWill && willDistribution) {
    notes.push('Hindu law (Dayabhaga): Full testamentary freedom — will is followed as written');
    const shares: ShareResult[] = willDistribution.map(w => {
      const member = familyMembers.find(m => m.id === w.memberId);
      return {
        memberId: w.memberId,
        name: member?.name || 'Unknown',
        relationship: member?.relationship || 'other',
        percentage: w.percentage,
        amount: estateValue * (w.percentage / 100),
        basis: 'As per will',
      };
    });
    return { shares, notes };
  }

  // Intestate succession (no will) — Dayabhaga rules
  notes.push('Hindu law (Dayabhaga): Intestate succession — equal division among children');

  const shares: ShareResult[] = [];
  const children = familyMembers.filter(m => ['son', 'daughter'].includes(m.relationship));
  const spouse = familyMembers.find(m => m.relationship === 'spouse');

  if (children.length > 0) {
    // Equal division among all children
    const perChild = estateValue / children.length;
    for (const child of children) {
      shares.push({
        memberId: child.id,
        name: child.name,
        relationship: child.relationship,
        percentage: 100 / children.length,
        amount: perChild,
        basis: 'Equal share among children (Dayabhaga)',
      });
    }
  } else if (spouse) {
    // No children — spouse inherits all
    shares.push({
      memberId: spouse.id,
      name: spouse.name,
      relationship: 'spouse',
      percentage: 100,
      amount: estateValue,
      basis: 'Sole heir — no children',
    });
  } else {
    // Fallback to parents
    const parents = familyMembers.filter(m => ['father', 'mother'].includes(m.relationship));
    if (parents.length > 0) {
      const perParent = estateValue / parents.length;
      for (const parent of parents) {
        shares.push({
          memberId: parent.id,
          name: parent.name,
          relationship: parent.relationship,
          percentage: 100 / parents.length,
          amount: perParent,
          basis: 'Parent heir — no children or spouse',
        });
      }
    }
  }

  return { shares, notes };
}
