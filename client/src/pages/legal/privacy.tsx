import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRtlDirection } from '@/lib/rtl-helper';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const { isRtl } = useRtlDirection();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto my-8">
        <Card>
          <CardHeader>
            <CardTitle className={`text-2xl font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('legal.privacyPolicy')}
            </CardTitle>
          </CardHeader>
          <CardContent className={isRtl ? 'text-right' : 'text-left'}>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.introduction')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.privacyIntroduction')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.informationCollection')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.informationCollectionDesc')}
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700">
                  <li>{t('legal.personalInfo')}</li>
                  <li>{t('legal.usageData')}</li>
                  <li>{t('legal.cookies')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.dataUsage')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.dataUsageDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.dataSecurity')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.dataSecurityDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.thirdPartyServices')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.thirdPartyServicesDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.userRights')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.userRightsDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.changes')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.changesDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.contact')}</h2>
                <p className="text-gray-700">
                  {t('legal.privacyContactDesc')}
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Email:</strong> privacy@rhal.com
                </p>
              </section>

              <div className="border-t pt-4 mt-6">
                <p className="text-sm text-gray-500">
                  {t('legal.lastUpdated')}: {t('legal.dateUpdated')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;