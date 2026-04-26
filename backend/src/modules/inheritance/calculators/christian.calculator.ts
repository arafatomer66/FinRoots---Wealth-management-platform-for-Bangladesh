/**
 * Christian Inheritance Calculator — Succession Act, 1925 (Bangladesh)
 *
 * Rules:
 * - Full testamentary freedom (can will entire estate)
 * - Intestate: 1/3 to spouse, 2/3 divided equally among children
 * - If no children: 1/2 to spouse, rest to other kindred
 * - If no spouse: entire estate to children equally
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

export function calculateChristianInheritance(
  estateValue: number,
  familyMembers: FamilyMember[],
  hasWill: boolean = false,
  willDistribution?: { memberId: number; percentage: number }[],
): { shares: ShareResult[]; notes: string[] } {
  const notes: string[] = [];

  // If there's a will, follow it (unrestricted testamentary freedom)
  if (hasWill && willDistribution) {
    notes.push('Succession Act 1925: Full testamentary freedom — will is followed');
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

  // Intestate succession
  notes.push('Succession Act 1925: Intestate succession rules applied');

  const shares: ShareResult[] = [];
  const spouse = familyMembers.find(m => m.relationship === 'spouse');
  const children = familyMembers.filter(m => ['son', 'daughter'].includes(m.relationship));

  if (spouse && children.length > 0) {
    // 1/3 to spouse, 2/3 divided equally among children
    shares.push({
      memberId: spouse.id,
      name: spouse.name,
      relationship: 'spouse',
      percentage: 100 / 3,
      amount: estateValue / 3,
      basis: 'Spouse: 1/3 of estate (with children)',
    });

    const childrenPool = (estateValue * 2) / 3;
    const perChild = childrenPool / children.length;
    for (const child of children) {
      shares.push({
        memberId: child.id,
        name: child.name,
        relationship: child.relationship,
        percentage: (perChild / estateValue) * 100,
        amount: perChild,
        basis: 'Child: equal share of 2/3',
      });
    }
  } else if (spouse && children.length === 0) {
    // 1/2 to spouse, rest to other kindred
    shares.push({
      memberId: spouse.id,
      name: spouse.name,
      relationship: 'spouse',
      percentage: 50,
      amount: estateValue / 2,
      basis: 'Spouse: 1/2 of estate (no children)',
    });

    const parents = familyMembers.filter(m => ['father', 'mother'].includes(m.relationship));
    if (parents.length > 0) {
      const remaining = estateValue / 2;
      const perParent = remaining / parents.length;
      for (const parent of parents) {
        shares.push({
          memberId: parent.id,
          name: parent.name,
          relationship: parent.relationship,
          percentage: (perParent / estateValue) * 100,
          amount: perParent,
          basis: 'Parent: share of remaining 1/2',
        });
      }
    }
  } else if (children.length > 0) {
    // No spouse — all to children equally
    const perChild = estateValue / children.length;
    for (const child of children) {
      shares.push({
        memberId: child.id,
        name: child.name,
        relationship: child.relationship,
        percentage: 100 / children.length,
        amount: perChild,
        basis: 'Child: equal share (no spouse)',
      });
    }
  }

  return { shares, notes };
}
