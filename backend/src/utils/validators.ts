import { body } from 'express-validator';
import { ASSET_TYPES, RELIGIONS, RELATIONSHIPS } from '../config/constants';

export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone('bn-BD').withMessage('Valid BD phone number required'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const assetValidation = [
  body('asset_type').isIn([...ASSET_TYPES]).withMessage('Invalid asset type'),
  body('name').trim().notEmpty().withMessage('Asset name is required'),
  body('current_value').isFloat({ min: 0 }).withMessage('Current value must be positive'),
];

export const familyMemberValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('relationship').isIn([...RELATIONSHIPS]).withMessage('Invalid relationship'),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format'),
];

export const profileValidation = [
  body('religion').optional().isIn([...RELIGIONS]).withMessage('Invalid religion'),
  body('tin_number').optional().isLength({ min: 12, max: 12 }).withMessage('TIN must be 12 digits'),
  body('nid_number').optional().isLength({ min: 10, max: 17 }).withMessage('Invalid NID number'),
];
