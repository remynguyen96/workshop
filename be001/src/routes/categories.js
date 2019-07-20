import { Router } from 'express';
import { Create, GetAll } from '../controllers/categories';

const router = new Router();

router.get('/', GetAll);
router.post('/', Create);

export default router;
