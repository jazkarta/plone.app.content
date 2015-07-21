from AccessControl import Unauthorized
from OFS.CopySupport import cookie_path
from Products.CMFPlone import PloneMessageFactory as _
from ZODB.POSException import ConflictError
from plone.app.content.browser.contents import ContentsBaseAction
from plone.app.content.interfaces import IStructureAction
from zope.component.hooks import getSite
from zope.interface import implements


class PasteAction(object):
    implements(IStructureAction)

    order = 3

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def get_options(self):
        return {
            'title': _('Paste'),
            'id': 'paste',
            'icon': 'paste',
            'url': self.context.absolute_url() + '/@@fc-paste'
        }


class PasteActionView(ContentsBaseAction):
    required_obj_permission = 'Copy or Move'
    success_msg = _('Successly pasted items')
    failure_msg = _('Failed to paste items')

    def __call__(self):
        self.protect()
        self.errors = []
        site = getSite()

        self.dest = site.restrictedTraverse(
            str(self.request.form['folder'].lstrip('/')))

        try:
            self.dest.manage_pasteObjects(self.request['__cp'])
        except ConflictError:
            raise
        except Unauthorized:
            # avoid this unfriendly exception text:
            # "You are not allowed to access 'manage_pasteObjects' in this
            # context"
            self.errors.append(
                _(u'You are not authorized to paste ${title} here.',
                    mapping={u'title': self.objectTitle(self.dest)}))

        resp = self.request.response
        resp.setCookie('__cp', 'deleted',
                       path='%s' % cookie_path(self.request),
                       expires='Wed, 31-Dec-97 23:59:59 GMT')
        self.request['__cp'] = None
        return self.message()