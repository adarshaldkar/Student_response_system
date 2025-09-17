import Joi from 'joi';
import { UserRole } from '../models/User';

export const validateUserCreate = (data: any) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.ADMIN)
  });
  
  return schema.validate(data);
};

export const validateUserLogin = (data: any) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  });
  
  return schema.validate(data);
};

export const validateFeedbackFormCreate = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    year: Joi.string().required(),
    section: Joi.string().required(),
    department: Joi.string().required(),
    subjects: Joi.array().items(Joi.string()).min(1).required(),
    evaluation_criteria: Joi.array().items(Joi.string()).min(1).required()
  });
  
  return schema.validate(data);
};

export const validateFeedbackFormUpdate = (data: any) => {
  const schema = Joi.object({
    title: Joi.string(),
    year: Joi.string(),
    section: Joi.string(),
    department: Joi.string(),
    subjects: Joi.array().items(Joi.string()).min(1),
    evaluation_criteria: Joi.array().items(Joi.string()).min(1),
    is_active: Joi.boolean()
  });
  
  return schema.validate(data);
};

export const validateStudentFeedbackCreate = (data: any) => {
  const schema = Joi.object({
    form_id: Joi.string().required(),
    student_id: Joi.string().required(),
    student_name: Joi.string().allow(''),
    ratings: Joi.object().required(),
    comments: Joi.string().allow('')
  });
  
  return schema.validate(data);
};