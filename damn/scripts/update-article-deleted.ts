import { AppDataSource } from '../src/typeorm.config';

async function updateArticleDeleted() {
  try {
    await AppDataSource.initialize();
    console.log('数据库连接成功！');

    const result = await AppDataSource.query(
      'UPDATE article SET is_deleted = 0'
    );

    console.log(`更新完成！影响了 ${result.changes} 条记录。`);
    
    const articles = await AppDataSource.query('SELECT id, title, is_deleted FROM article');
    console.log('当前 article 数据：');
    console.table(articles);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('更新失败：', error);
    process.exit(1);
  }
}

updateArticleDeleted();
