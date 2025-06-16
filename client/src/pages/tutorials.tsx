
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import { useTutorials } from "@/hooks/use-tutorials";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play } from "lucide-react";

const Tutorials = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: tutorials = [], isLoading, error } = useTutorials();

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
        </div>
      </PageLayout>
    );
  }

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      <Helmet>
        <title>{t('tutorials.title')} | Media Intelligence Platform</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{t('tutorials.title')}</h1>
        <Input
          type="search"
          placeholder={t('tutorials.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {error ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-3">Error Loading Tutorials</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <Card key={tutorial.id} className="overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {tutorial.thumbnailUrl && (
                  <img
                    src={tutorial.thumbnailUrl}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="icon" className="w-12 h-12 rounded-full bg-[#cba344]">
                    <Play className="h-6 w-6 text-white" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                <p className="text-sm text-gray-600">{tutorial.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!error && filteredTutorials.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? t('tutorials.noResults') : t('tutorials.noTutorials')}
        </div>
      )}
    </PageLayout>
  );
};

export default Tutorials;
