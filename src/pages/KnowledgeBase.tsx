import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticles } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, ThumbsUp, ThumbsDown, ArrowLeft, Eye } from 'lucide-react';

const KnowledgeBase = () => {
  const { articleId } = useParams();
  const articles = getArticles();
  const [search, setSearch] = useState('');

  // Article detail view
  if (articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return <p className="text-center py-20 text-muted-foreground">Article not found</p>;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/knowledge-base"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Knowledge Base</Button></Link>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{article.category}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views}</span>
            </div>
            <CardTitle className="text-2xl">{article.title}</CardTitle>
            <p className="text-muted-foreground">{article.summary}</p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">{article.body}</div>
            <div className="flex items-center gap-4 mt-8 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Was this helpful?</span>
              <Button variant="outline" size="sm"><ThumbsUp className="mr-1 h-3 w-3" /> Yes ({article.helpful_yes})</Button>
              <Button variant="outline" size="sm"><ThumbsDown className="mr-1 h-3 w-3" /> No ({article.helpful_no})</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  const filtered = articles.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    a.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> Knowledge Base</h1>
          <p className="text-muted-foreground">Find answers to common questions</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-8 w-64" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => (
          <Link key={a.id} to={`/knowledge-base/${a.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{a.category}</Badge>
                  {a.featured && <Badge className="text-xs bg-primary">Featured</Badge>}
                </div>
                <CardTitle className="text-base">{a.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {a.views}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {a.helpful_yes}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center py-12 text-muted-foreground">No articles found</p>}
    </div>
  );
};

export default KnowledgeBase;
