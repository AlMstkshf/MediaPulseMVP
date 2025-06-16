import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { useMediaItems } from "@/hooks/use-media";
import { 
  useJournalists, 
  useMediaSources, 
  usePressReleases 
} from "@/hooks/use-media-center";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui";
import { 
  Filter, 
  Search, 
  Upload, 
  MoreVertical, 
  Image, 
  FileText, 
  Video,
  Plus,
  Calendar,
  Globe,
  Share2,
  Building,
  Shield,
  ExternalLink,
  Newspaper,
  Camera,
  Download,
  Mail,
  Phone,
  User,
  Users,
  Edit,
  Trash2,
  Megaphone,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";

// Mock data for Ajman Government press releases
const ajmanGovPressReleases = [
  {
    id: 1,
    title: "Ajman Government Launches New Digital Services Platform",
    date: "2025-04-18",
    summary: "The Ajman Government announced the launch of a new unified digital services platform aimed at enhancing resident experience and streamlining government services.",
    imageUrl: "https://placehold.co/600x400/004d7c/white?text=Ajman+Digital+Services",
    source: "Ajman Government",
    sourceUrl: "https://www.ajman.ae/en/news"
  },
  {
    id: 2,
    title: "Ajman Ruler Inaugurates New Smart City Project",
    date: "2025-04-15",
    summary: "His Highness Sheikh Humaid bin Rashid Al Nuaimi, Supreme Council Member and Ruler of Ajman, inaugurated the first phase of the Ajman Smart City project.",
    imageUrl: "https://placehold.co/600x400/004d7c/white?text=Smart+City+Project",
    source: "Ajman Government",
    sourceUrl: "https://www.ajman.ae/en/news"
  },
  {
    id: 3,
    title: "Ajman Department of Economic Development Announces New Business Incentives",
    date: "2025-04-10",
    summary: "New incentives for small and medium enterprises were announced by the Ajman Department of Economic Development to support business growth.",
    imageUrl: "https://placehold.co/600x400/004d7c/white?text=Business+Incentives",
    source: "Ajman Government",
    sourceUrl: "https://www.ajman.ae/en/news"
  }
];

// Mock data for Ajman Police press releases
const ajmanPoliceNews = [
  {
    id: 1,
    title: "Ajman Police Launches Road Safety Campaign",
    date: "2025-04-19",
    summary: "Ajman Police has launched a comprehensive road safety campaign targeting school zones and residential areas to reduce traffic accidents.",
    imageUrl: "https://placehold.co/600x400/1a5f7a/white?text=Road+Safety+Campaign",
    source: "Ajman Police",
    sourceUrl: "https://www.ajmanpolice.gov.ae/en/news.html"
  },
  {
    id: 2,
    title: "Ajman Police Awarded for Excellence in Smart Services",
    date: "2025-04-16",
    summary: "The Ajman Police General Command has been recognized for its outstanding implementation of smart services and digital transformation initiatives.",
    imageUrl: "https://placehold.co/600x400/1a5f7a/white?text=Excellence+Award",
    source: "Ajman Police",
    sourceUrl: "https://www.ajmanpolice.gov.ae/en/news.html"
  },
  {
    id: 3,
    title: "Ajman Police Conducts Emergency Response Exercise",
    date: "2025-04-12",
    summary: "A large-scale emergency response exercise was conducted in collaboration with civil defense and emergency services to test readiness protocols.",
    imageUrl: "https://placehold.co/600x400/1a5f7a/white?text=Emergency+Exercise",
    source: "Ajman Police",
    sourceUrl: "https://www.ajmanpolice.gov.ae/en/news.html"
  }
];

const MediaCenter = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSourceTab, setSelectedSourceTab] = useState<string>("internal");
  const [selectedGovTab, setSelectedGovTab] = useState<string>("ajman-gov");
  const [mediaDirectoryTab, setMediaDirectoryTab] = useState<string>("journalists");
  const [journalistSearchQuery, setJournalistSearchQuery] = useState("");
  const [mediaSourceSearchQuery, setMediaSourceSearchQuery] = useState("");
  const [pressReleaseSearchQuery, setPressReleaseSearchQuery] = useState("");
  
  // Fetch media items with optional filter by media type
  const { data: mediaItems, isLoading } = useMediaItems({
    mediaType: activeTab !== "all" ? activeTab : undefined
  });
  
  // Fetch journalists directory data
  const { data: journalists, isLoading: isLoadingJournalists } = useJournalists({
    search: journalistSearchQuery
  });
  
  // Fetch media sources data
  const { data: mediaSources, isLoading: isLoadingMediaSources } = useMediaSources({
    search: mediaSourceSearchQuery
  });
  
  // Fetch press releases
  const { data: pressReleases, isLoading: isLoadingPressReleases } = usePressReleases({
    search: pressReleaseSearchQuery
  });
  
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Helper to safely format dates with a fallback
  const formatDate = (dateInput: any) => {
    if (!dateInput) return t('mediaCenter.noDate');
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return format(date, 'dd MMM yyyy');
    } catch (e) {
      console.error("Date formatting error:", e);
      return t('mediaCenter.noDate');
    }
  };
  
  const getCategoryBadge = (category: string) => {
    let color;
    switch (category) {
      case "projects":
        color = "bg-blue-100 text-blue-800";
        break;
      case "events":
        color = "bg-purple-100 text-purple-800";
        break;
      case "reports":
        color = "bg-green-100 text-green-800";
        break;
      case "news":
        color = "bg-orange-100 text-orange-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }
    
    return (
      <Badge variant="outline" className={`border-0 ${color}`}>
        {t(`mediaCenter.${category}`)}
      </Badge>
    );
  };
  
  // Filter media items by search query
  const filteredItems = mediaItems?.filter(item => 
    searchQuery ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('mediaCenter.title')}</h2>
        <div className="flex items-center space-x-4">
          <Button className="bg-[#cba344] hover:bg-[#b8943e] text-white">
            <Upload className="h-4 w-4 mr-2" />
            <span>{t('mediaCenter.upload')}</span>
          </Button>
        </div>
      </div>
      
      {/* UAE News Sources Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('mediaCenter.uaeNewsSources')}</CardTitle>
          <CardDescription>{t('mediaCenter.integratedPlatforms')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSourceTab} onValueChange={setSelectedSourceTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="sources">{t('mediaCenter.sourcePlatforms')}</TabsTrigger>
              <TabsTrigger value="ajman-gov">{t('mediaCenter.ajmanGovPressReleases')}</TabsTrigger>
              <TabsTrigger value="ajman-police">{t('mediaCenter.ajmanPoliceNews')}</TabsTrigger>
              <TabsTrigger value="wam">{t('mediaCenter.wamNewsAgency')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sources">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Ajman Government Website */}
                <div 
                  className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedSourceTab("ajman-gov")}
                >
                  <div className="h-24 bg-[#004d7c] flex items-center justify-center p-4">
                    <Building className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{t('mediaCenter.ajmanGovPressReleases')}</h3>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {t('common.official')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {t('mediaCenter.ajmanGovDescription')}
                    </p>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" className="text-[#004d7c]" onClick={() => setSelectedSourceTab("ajman-gov")}>
                        <Globe className="h-4 w-4 mr-2" />
                        <span>{t('mediaCenter.browse')}</span>
                      </Button>
                      <a 
                        href="https://www.ajman.ae/en/news" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 flex items-center hover:text-[#004d7c]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('mediaCenter.visitWebsite')}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Ajman Police Website */}
                <div 
                  className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedSourceTab("ajman-police")}
                >
                  <div className="h-24 bg-[#1a5f7a] flex items-center justify-center p-4">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{t('mediaCenter.ajmanPoliceNews')}</h3>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        {t('common.official')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {t('mediaCenter.ajmanPoliceDescription')}
                    </p>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" className="text-[#1a5f7a]" onClick={() => setSelectedSourceTab("ajman-police")}>
                        <Globe className="h-4 w-4 mr-2" />
                        <span>{t('mediaCenter.browse')}</span>
                      </Button>
                      <a 
                        href="https://www.ajmanpolice.gov.ae/en/news.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 flex items-center hover:text-[#1a5f7a]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('mediaCenter.visitWebsite')}
                      </a>
                    </div>
                  </div>
                </div>

                {/* WAM News Agency */}
                <div 
                  className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedSourceTab("wam")}
                >
                  <div className="h-24 bg-[#862328] flex items-center justify-center p-4">
                    <Newspaper className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{t('mediaCenter.wamNewsAgency')}</h3>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                        {t('common.official')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {t('mediaCenter.wamDescription')}
                    </p>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" className="text-[#862328]" onClick={() => setSelectedSourceTab("wam")}>
                        <Globe className="h-4 w-4 mr-2" />
                        <span>{t('mediaCenter.browse')}</span>
                      </Button>
                      <a 
                        href="https://wam.ae/en" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 flex items-center hover:text-[#862328]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('mediaCenter.visitWebsite')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Ajman Government Press Releases */}
            <TabsContent value="ajman-gov">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-[#004d7c]" />
                  <h3 className="text-lg font-medium">{t('mediaCenter.ajmanGovPressReleases')}</h3>
                </div>
                <a 
                  href="https://www.ajman.ae/en/news" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-[#004d7c] flex items-center hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {t('mediaCenter.visitOfficialWebsite')}
                </a>
              </div>
              
              <div className="space-y-4">
                {ajmanGovPressReleases.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/4 h-40 md:h-full bg-blue-50">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between">
                          <Badge className="bg-blue-100 text-blue-800 mb-2">
                            Ajman Government
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium mb-2">{item.title}</h4>
                        <p className="text-gray-600 mb-4">{item.summary}</p>
                        <div className="flex justify-between items-center">
                          <Button variant="outline" size="sm" className="text-[#004d7c]">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>View Full Press Release</span>
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Ajman Police News */}
            <TabsContent value="ajman-police">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#1a5f7a]" />
                  <h3 className="text-lg font-medium">Ajman Police News & Updates</h3>
                </div>
                <a 
                  href="https://www.ajmanpolice.gov.ae/en/news.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-[#1a5f7a] flex items-center hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit Official Website
                </a>
              </div>
              
              <div className="space-y-4">
                {ajmanPoliceNews.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/4 h-40 md:h-full bg-teal-50">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between">
                          <Badge className="bg-green-100 text-green-800 mb-2">
                            Ajman Police
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium mb-2">{item.title}</h4>
                        <p className="text-gray-600 mb-4">{item.summary}</p>
                        <div className="flex justify-between items-center">
                          <Button variant="outline" size="sm" className="text-[#1a5f7a]">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>View Full Article</span>
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* WAM News */}
            <TabsContent value="wam">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-[#862328]" />
                  <h3 className="text-lg font-medium">WAM News Agency</h3>
                </div>
                <a 
                  href="https://wam.ae/en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-[#862328] flex items-center hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit Official Website
                </a>
              </div>
              
              <Card className="p-6">
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">WAM News Feed Integration</h4>
                    <p className="text-gray-500 max-w-lg">
                      Access the latest Emirates News Agency (WAM) content directly from their official website by clicking the button below.
                    </p>
                    <Button className="mt-4 bg-[#862328] hover:bg-[#6a1c20] text-white">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <a 
                        href="https://wam.ae/en" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white"
                      >
                        Visit WAM News Portal
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Media Directory Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('mediaCenter.mediaDirectory')}</CardTitle>
          <CardDescription>{t('mediaCenter.mediaDirectoryDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mediaDirectoryTab} onValueChange={setMediaDirectoryTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="journalists">
                <User className="h-4 w-4 mr-2" />
                {t('mediaCenter.journalists')}
              </TabsTrigger>
              <TabsTrigger value="media-sources">
                <Building className="h-4 w-4 mr-2" />
                {t('mediaCenter.mediaSources')}
              </TabsTrigger>
              <TabsTrigger value="press-releases">
                <Megaphone className="h-4 w-4 mr-2" />
                {t('mediaCenter.pressReleases')}
              </TabsTrigger>
            </TabsList>
            
            {/* Journalists Directory Tab */}
            <TabsContent value="journalists">
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder={t('mediaCenter.searchJournalists')}
                    className="pl-8"
                    value={journalistSearchQuery}
                    onChange={(e) => setJournalistSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="bg-[#1a5f7a] hover:bg-[#13475c] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>{t('mediaCenter.addJournalist')}</span>
                </Button>
              </div>
              
              {isLoadingJournalists ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1a5f7a]"></div>
                </div>
              ) : journalists && journalists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {journalists.map((journalist) => (
                    <Card key={journalist.id} className="overflow-hidden hover:shadow-md transition-all">
                      <CardContent className="p-0">
                        <div className="p-4 flex items-start gap-3">
                          <Avatar className="h-12 w-12 border">
                            {journalist.avatarUrl ? (
                              <AvatarImage src={journalist.avatarUrl} alt={journalist.name} />
                            ) : (
                              <AvatarFallback className="bg-[#1a5f7a] text-white">
                                {journalist.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium mb-1">{journalist.name}</h3>
                              <Badge variant="outline" className={journalist.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {journalist.isActive ? t('common.active') : t('common.inactive')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{journalist.organization}</p>
                            {journalist.beat && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 mt-1">
                                {journalist.beat}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Separator />
                        <div className="p-3 flex justify-between items-center bg-gray-50">
                          <div className="flex gap-3">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500" asChild>
                              <a href={`mailto:${journalist.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                            {journalist.phone && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500" asChild>
                                <a href={`tel:${journalist.phone}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Journalist Card */}
                  <div className="border rounded-lg overflow-hidden bg-white flex flex-col items-center justify-center h-[160px] border-dashed cursor-pointer hover:border-[#1a5f7a] hover:bg-gray-50 transition-all">
                    <Button variant="ghost" size="lg" className="rounded-full h-12 w-12">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">{t('mediaCenter.addNewJournalist')}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{t('mediaCenter.noJournalists')}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t('mediaCenter.noJournalistsDesc')}</p>
                  <Button className="bg-[#1a5f7a] hover:bg-[#13475c] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    <span>{t('mediaCenter.addJournalist')}</span>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Media Sources Tab */}
            <TabsContent value="media-sources">
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder={t('mediaCenter.searchMediaSources')}
                    className="pl-8"
                    value={mediaSourceSearchQuery}
                    onChange={(e) => setMediaSourceSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="bg-[#004d7c] hover:bg-[#003a5e] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>{t('mediaCenter.addMediaSource')}</span>
                </Button>
              </div>
              
              {isLoadingMediaSources ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#004d7c]"></div>
                </div>
              ) : mediaSources && mediaSources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mediaSources.map((source) => (
                    <Card key={source.id} className="overflow-hidden hover:shadow-md transition-all">
                      <CardContent className="p-0">
                        <div className="h-24 bg-[#004d7c] flex items-center justify-center p-4 relative">
                          {source.logoUrl ? (
                            <img 
                              src={source.logoUrl} 
                              alt={source.name} 
                              className="h-16 max-w-full object-contain" 
                            />
                          ) : (
                            <Newspaper className="h-12 w-12 text-white" />
                          )}
                          <Badge 
                            className="absolute top-2 right-2" 
                            variant="outline"
                            style={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                              color: 'white',
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            {source.type}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium">{source.name}</h3>
                            <Badge variant="outline" className={source.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {source.isActive ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{source.country}</p>
                          <div className="flex items-center text-xs text-blue-600 hover:underline mb-3">
                            <Globe className="h-3 w-3 mr-1" />
                            {source.website ? (
                              <a href={source.website} target="_blank" rel="noopener noreferrer">
                                {source.website.replace(/^https?:\/\//, '')}
                              </a>
                            ) : (
                              <span className="text-gray-400">{t('mediaCenter.noWebsite')}</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              <span>{t('mediaCenter.visitSite')}</span>
                            </Button>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Media Source Card */}
                  <div className="border rounded-lg overflow-hidden bg-white flex flex-col items-center justify-center h-[220px] border-dashed cursor-pointer hover:border-[#004d7c] hover:bg-gray-50 transition-all">
                    <Button variant="ghost" size="lg" className="rounded-full h-12 w-12">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">{t('mediaCenter.addNewMediaSource')}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{t('mediaCenter.noMediaSources')}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t('mediaCenter.noMediaSourcesDesc')}</p>
                  <Button className="bg-[#004d7c] hover:bg-[#003a5e] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    <span>{t('mediaCenter.addMediaSource')}</span>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Press Releases Tab */}
            <TabsContent value="press-releases">
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder={t('mediaCenter.searchPressReleases')}
                    className="pl-8"
                    value={pressReleaseSearchQuery}
                    onChange={(e) => setPressReleaseSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="bg-[#862328] hover:bg-[#6b1c20] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>{t('mediaCenter.createPressRelease')}</span>
                </Button>
              </div>
              
              {isLoadingPressReleases ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#862328]"></div>
                </div>
              ) : pressReleases && pressReleases.length > 0 ? (
                <div className="space-y-4">
                  {pressReleases.map((release) => (
                    <Card key={release.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {release.featuredImage && (
                          <div className="w-full md:w-1/4 h-40 md:h-full bg-gray-50">
                            <img 
                              src={release.featuredImage} 
                              alt={release.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <div className={`flex-1 p-4 ${!release.featuredImage ? 'md:w-full' : ''}`}>
                          <div className="flex justify-between mb-2">
                            <Badge className={
                              release.status === 'Draft' ? "bg-gray-100 text-gray-800" :
                              release.status === 'Published' ? "bg-green-100 text-green-800" :
                              release.status === 'Scheduled' ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {release.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {release.publishDate 
                                ? formatDate(release.publishDate)
                                : formatDate(release.createdAt)}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium mb-2">{release.title}</h4>
                          <p className="text-gray-600 mb-4 line-clamp-2">{release.summary || release.content.substring(0, 150)}</p>
                          
                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              <span>{t('mediaCenter.viewDetails')}</span>
                            </Button>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Megaphone className="h-4 w-4 mr-2" />
                                    <span>{t('mediaCenter.publish')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>{t('mediaCenter.schedule')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    <span>{t('common.delete')}</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{t('mediaCenter.noPressReleases')}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t('mediaCenter.noPressReleasesDesc')}</p>
                  <Button className="bg-[#862328] hover:bg-[#6b1c20] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    <span>{t('mediaCenter.createPressRelease')}</span>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Internal Media Library */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>{t('mediaCenter.internalMediaLibrary')}</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('mediaCenter.search')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>{t('mediaCenter.filter')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t('mediaCenter.projects')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('mediaCenter.events')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('mediaCenter.reports')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('mediaCenter.news')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{t('mediaCenter.date')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t('mediaCenter.newest')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('mediaCenter.oldest')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('mediaCenter.lastWeek')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('mediaCenter.lastMonth')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">{t('mediaCenter.all')}</TabsTrigger>
              <TabsTrigger value="image">{t('mediaCenter.images')}</TabsTrigger>
              <TabsTrigger value="video">{t('mediaCenter.videos')}</TabsTrigger>
              <TabsTrigger value="document">{t('mediaCenter.documents')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : filteredItems && filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden bg-white">
                      <div className="h-36 bg-gray-200 relative">
                        {item.thumbnailUrl ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getMediaTypeIcon(item.mediaType)}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded flex items-center">
                          {getMediaTypeIcon(item.mediaType)}
                          <span className="ml-1">{t(`mediaCenter.${item.mediaType}`)}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {t('mediaCenter.updated')} {formatDate(item.updatedAt)}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex">
                            {item.category && getCategoryBadge(item.category)}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>{t('mediaCenter.view')}</DropdownMenuItem>
                              <DropdownMenuItem>{t('mediaCenter.edit')}</DropdownMenuItem>
                              <DropdownMenuItem>{t('mediaCenter.download')}</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500">{t('mediaCenter.delete')}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Item Card */}
                  <div className="border rounded-lg overflow-hidden bg-white flex flex-col items-center justify-center h-[244px] border-dashed">
                    <Button variant="ghost" size="lg" className="rounded-full h-16 w-16">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">{t('mediaCenter.addNew')}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{t('mediaCenter.noItems')}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t('mediaCenter.noItemsDesc')}</p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    <span>{t('mediaCenter.upload')}</span>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="image" className="mt-0">
              {/* Similar content structure as "all" but filtered for images */}
              <div className="text-center py-8 text-gray-500">
                {activeTab === "image" ? t('mediaCenter.imagesContent') : ""}
              </div>
            </TabsContent>
            
            <TabsContent value="video" className="mt-0">
              <div className="text-center py-8 text-gray-500">
                {activeTab === "video" ? t('mediaCenter.videosContent') : ""}
              </div>
            </TabsContent>
            
            <TabsContent value="document" className="mt-0">
              <div className="text-center py-8 text-gray-500">
                {activeTab === "document" ? t('mediaCenter.documentsContent') : ""}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default MediaCenter;
