
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Play, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "wouter";

interface TutorialSectionProps {
  rtl?: boolean;
  compact?: boolean;
}

const TutorialSection = ({ rtl = false, compact = false }: TutorialSectionProps) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const isRtl = rtl || i18n.language === 'ar';
  
  const { data: tutorials, isLoading } = useQuery({ 
    queryKey: ["/api/tutorials", i18n.language],
    queryFn: async () => {
      const res = await fetch(`/api/tutorials?language=${i18n.language}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tutorials');
      }
      return await res.json();
    }
  });
  
  interface Tutorial {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl?: string;
    duration: string;
    level: string;
  }
  
  const displayTutorials: Tutorial[] = tutorials?.slice(0, 3) || [
    {
      id: 1,
      title: t('tutorials.sample.title1'),
      description: t('tutorials.sample.desc1'),
      thumbnailUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
      duration: "5:24",
      level: "beginner"
    },
    {
      id: 2,
      title: t('tutorials.sample.title2'),
      description: t('tutorials.sample.desc2'),
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      duration: "8:12",
      level: "intermediate"
    },
    {
      id: 3,
      title: t('tutorials.sample.title3'),
      description: t('tutorials.sample.desc3'),
      thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
      duration: "12:45",
      level: "advanced"
    }
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "beginner":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-0">{t('tutorials.beginner')}</Badge>;
      case "intermediate":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-0">{t('tutorials.intermediate')}</Badge>;
      case "advanced":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-0">{t('tutorials.advanced')}</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-0">{level}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-bold">{t('tutorials.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className={`flex flex-row items-center justify-between ${compact ? 'pb-2 pt-3 px-4' : 'pb-2'} space-y-0`}>
        <CardTitle className="text-lg font-bold">{t('tutorials.title')}</CardTitle>
        <Link href="/tutorials">
          <Button variant="link" className="text-primary flex items-center">
            {t('tutorials.viewAll')}
            {!compact && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </Link>
      </CardHeader>
      <CardContent className={compact ? 'pt-0 px-4 pb-4' : undefined}>
        {compact ? (
          // Compact view
          <div className="space-y-3">
            {displayTutorials.slice(0, 2).map((tutorial) => (
              <div key={tutorial.id} className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} border rounded-lg overflow-hidden`}>
                <div className="w-24 h-16 bg-gray-300 relative flex-shrink-0">
                  <img 
                    src={tutorial.thumbnailUrl} 
                    alt={tutorial.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-8 h-8 bg-[#cba344] bg-opacity-90 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-100"
                      onClick={() => tutorial.videoUrl ? setSelectedVideo(tutorial.videoUrl) : null}
                    >
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className={`p-2 flex-1 ${isRtl ? 'text-right pr-3' : 'text-left pl-3'}`}>
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">{tutorial.title}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{t('tutorials.duration')}: {tutorial.duration}</p>
                    <div className="ml-auto">{getLevelBadge(tutorial.level)}</div>
                  </div>
                </div>
                <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
                  <DialogContent className="max-w-4xl">
                    {selectedVideo && (
                      <video controls className="w-full">
                        <source src={selectedVideo} type="video/mp4" />
                        {t('tutorials.browserNotSupported')}
                      </video>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        ) : (
          // Full view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTutorials.map((tutorial) => (
              <div key={tutorial.id} className="border rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-300 relative flex items-center justify-center">
                  <img 
                    src={tutorial.thumbnailUrl} 
                    alt={tutorial.title} 
                    className="w-full h-full object-cover opacity-70" 
                  />
                  <div className="absolute flex items-center justify-center">
                    <div 
                      className="w-16 h-16 bg-[#cba344] bg-opacity-90 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-100"
                      onClick={() => tutorial.videoUrl ? setSelectedVideo(tutorial.videoUrl) : null}
                    >
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
                  <DialogContent className="max-w-4xl">
                    {selectedVideo && (
                      <video controls className="w-full">
                        <source src={selectedVideo} type="video/mp4" />
                        {t('tutorials.browserNotSupported')}
                      </video>
                    )}
                  </DialogContent>
                </Dialog>
                <div className="p-3">
                  <h4 className="font-medium mb-1">{tutorial.title}</h4>
                  <p className="text-xs text-gray-500 mb-2">{t('tutorials.duration')}: {tutorial.duration}</p>
                  <div className="flex items-center justify-between">
                    {getLevelBadge(tutorial.level)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TutorialSection;
